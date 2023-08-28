const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

function setUpSocketIoServer(httpServer, redisClient) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const pubClient = redisClient;
  const subClient = pubClient.duplicate();

  io.adapter(createAdapter(pubClient, subClient));

  async function getOrderData() {
    try {
      const orderDataArray = await redisClient.LRANGE("orderData", 0, -1);
      return orderDataArray.map(JSON.parse);
    } catch (err) {
      console.error("Error fetching order data from Redis:", err);
      return [];
    }
  }

  async function getHistoryOrderData() {
    try {
      const orderDataArray = await redisClient.LRANGE(
        "historyOrderData",
        0,
        -1
      );
      return orderDataArray.map(JSON.parse);
    } catch (err) {
      console.error("Error fetching history order data from Redis:", err);
      return [];
    }
  }

  async function setOrderData(orderData, callback) {
    try {
      const result = await redisClient.RPUSH(
        "orderData",
        JSON.stringify(orderData)
      );
      io.emit("getOrderData", orderData);
      console.log("RPUSH order data result:", result);
      callback({
        status: "ok",
      });
    } catch (err) {
      console.error("Error pushing order data to Redis list:", err);
      callback({
        status: "error",
      });
    }
  }

  async function setHistoryOrderData(orderData) {
    try {
      const result = await redisClient.LPUSH(
        "historyOrderData",
        JSON.stringify(orderData)
      );
      io.emit("getHistoryOrderData", orderData);
      console.log("LPUSH history order data result:", result);
    } catch (err) {
      console.error("Error pushing history order data to Redis list:", err);
      throw new Error("Error pushing history order data to Redis list");
    }
  }

  async function deleteOrderData(orderData, totalTime) {
    try {
      const result = await redisClient.LREM(
        "orderData",
        0,
        JSON.stringify(orderData)
      );
      if (orderData.orderStatus === "READY TO SERVE") {
        orderData.orderStatus = "COMPLETED"
        orderData.totalTime = totalTime;
        await setHistoryOrderData(orderData);
      }
      console.log(
        `Order ${orderData.orderNum} is completed. Removed from Redis. LREM result:`,
        result
      );
    } catch (err) {
      console.error("Error removing data from Redis list:", err);
      throw new Error("Error removing data from Redis list");
    }
  }

  async function updateOrderDataStatus(orderData, totalTime, callback) {
    try {
      const orderDataArray = await getOrderData();
      const indexToUpdate = orderDataArray.findIndex(
        (order) => order.orderNum === orderData.orderNum
      );

      console.log("INDEX :", indexToUpdate)

      if (indexToUpdate !== -1) {
        const response = await fetch(
          `${
            process.env.API_URL
          }/api/v1/order/update-status/${orderData.orderNum.replaceAll(
            "/",
            "-"
          )}`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderStatus: orderData.orderStatus }),
          }
        );

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        if (
          orderData.orderStatus === "COMPLETED" ||
          orderData.orderStatus === "CANCELLED"
        ) {
          await deleteOrderData(orderDataArray[indexToUpdate], totalTime);
          orderDataArray.splice(indexToUpdate, 1);
          console.log(orderDataArray);
        } else {
          await redisClient.LSET(
            "orderData",
            indexToUpdate,
            JSON.stringify(orderData)
          );
          orderDataArray[indexToUpdate] = orderData;
        }

        io.emit("getUpdatedOrderData", orderDataArray);
        callback({
          status: "ok",
        });
        console.log("Order is succesfully updated");
      } else {
        console.log("Order not found for update:", orderData.orderNum);
        throw new Error("Order not found");
      }
      console.log(orderDataArray)
    } catch (err) {
      callback({
        status: "error",
      });
      console.error("Error updating order data:", err);
    }
  }

  async function updateOrderData(orderData, callback) {
    try {
      const orderDataArray = await getOrderData();
      const indexToUpdate = orderDataArray.findIndex(
        (order) => order.orderNum === orderData.orderNum
      );

      if (indexToUpdate !== -1) {
        const response = await fetch(
          `${
            process.env.API_URL
          }/api/v1/order/change-order/${orderData.orderNum.replaceAll(
            "/",
            "-"
          )}`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
          }
        );

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const updatedRedisData = {
          orderNum: orderData.orderNum,
          tableName: orderData.tableName,
          customerName: orderData.customerName,
          orderList: orderData.orderList,
          orderStatus: orderData.orderStatus,
          createdAt: orderDataArray[indexToUpdate].createdAt
        };

        await redisClient.LSET(
          "orderData",
          indexToUpdate,
          JSON.stringify(updatedRedisData)
        );
        orderDataArray[indexToUpdate] = updatedRedisData;

        io.emit("getUpdatedOrderData", orderDataArray);
        callback({
          status: "ok",
        });
        console.log("Order is succesfully updated");
      } else {
        console.log("Order not found for update:", orderData.orderNum);
        throw new Error("Order not found");
      }
    } catch (err) {
      callback({
        status: "error",
      });
      console.error("Error updating order data:", err);
    }
  }

  io.on("connection", async (socket) => {
    console.log(socket.id);
    socket.emit("getInitialOrderData", await getOrderData());
    socket.emit("getInitialHistoryOrderData", await getHistoryOrderData());

    socket.on("sendOrderData", async (orderData, callback) => {
      await setOrderData(orderData, callback);
    });

    socket.on("updateOrderStatus", async (orderData, totalTime, callback) => {
      await updateOrderDataStatus(orderData, totalTime, callback);
    });

    socket.on("updateOrderData", async (orderData, callback) => {
      await updateOrderData(orderData, callback);
    });
  });

  return io;
}

module.exports = setUpSocketIoServer;
