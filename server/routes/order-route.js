const router = require("express").Router();
const Order = require("../models/order-model");
const { generateOrderNumber } = require("../utility/generateOrderNumber");

router.get("/health-check", async (req, res, next) => {
  res.send("Server is up");
});

router.get("/", async (req, res, next) => {
  const orderList = await Order.find({});
  res.json(orderList);
});

router.get("/:orderNum", async (req, res, next) => {
  let orderNum = req.params.orderNum.split("-");
  orderNum =
    orderNum[0] +
    "/" +
    orderNum[1] +
    "-" +
    orderNum[2] +
    "-" +
    orderNum[3] +
    "/" +
    orderNum[4];
  const order = await Order.findOne({ orderNum: orderNum });
  if (!order) {
    console.log(`Order ${orderNum} does not exist`);
    res.status(400).json({ message: "Order does not exist" });
    return;
  }

  res.json(order);
});

router.post("/", async (req, res, next) => {
  try {
    const orderList = await Order.find({});
    req.body.orderNum = generateOrderNumber(orderList, "Asia/Jakarta");
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();
    res.json(savedOrder);
  } catch (err) {
    console.log(`Failed to save new order, error message : ${err.message}`);
    res.status(400).json({ message: "Failed to save new order" });
  }
});

router.delete("/:orderNum", async (req, res, next) => {
  let orderNum = req.params.orderNum.split("-");
  orderNum =
    orderNum[0] +
    "/" +
    orderNum[1] +
    "-" +
    orderNum[2] +
    "-" +
    orderNum[3] +
    "/" +
    orderNum[4];
  const order = await Order.findOne({ orderNum: orderNum });

  if (!order) {
    console.log(`Order ${orderNum} does not exist`);

    return;
  }

  const deletedOrder = await Order.deleteOne({ orderNum: orderNum });
  res.json(deletedOrder);
});

router.put("/:orderNum", async (req, res, next) => {
  let orderNum = req.params.orderNum.split("-");
  orderNum =
    orderNum[0] +
    "/" +
    orderNum[1] +
    "-" +
    orderNum[2] +
    "-" +
    orderNum[3] +
    "/" +
    orderNum[4];
  const order = await Order.findOne({ orderNum: orderNum });
  if (!order) {
    console.log(`Order ${orderNum} does not exist`);
    res.status(400).json({ message: "Order does not exist" });
    return;
  }

  order.orderList = req.body.orderList;
  order.tableName = req.body.tableName;
  order.customerName = req.body.customerName;
  order.orderStatus = req.body.orderStatus;
  order.payment = req.body.payment;

  const savedOrder = await order.save();

  res.json(savedOrder);
});

router.post("/change-order/:orderNum", async (req, res, next) => {
  let orderNum = req.params.orderNum.split("-");
  orderNum =
    orderNum[0] +
    "/" +
    orderNum[1] +
    "-" +
    orderNum[2] +
    "-" +
    orderNum[3] +
    "/" +
    orderNum[4];
  const order = await Order.findOne({ orderNum: orderNum });
  if (!order) {
    console.log(`Order ${orderNum} does not exist`);
    res.status(400).json({ message: "Order does not exist" });
    return;
  }
  if (order.orderStatus !== "PENDING") {
    console.log(`Order ${orderNum} cannot be changed anymore`);
    res.status(400).json({ message: "Order cannot be changed anymore" });
    return;
  }

  order.orderList = req.body.orderList;
  order.tableName = req.body.tableName;
  order.customerName = req.body.customerName;
  order.orderStatus = req.body.orderStatus;
  order.payment = req.body.payment;

  const savedOrder = await order.save();

  res.json(savedOrder);
});

router.post("/make-payment/:orderNum", async (req, res, next) => {
  let orderNum = req.params.orderNum.split("-");
  orderNum =
    orderNum[0] +
    "/" +
    orderNum[1] +
    "-" +
    orderNum[2] +
    "-" +
    orderNum[3] +
    "/" +
    orderNum[4];
  const order = await Order.findOne({ orderNum: orderNum });
  if (!order) {
    console.log(`Order ${orderNum} does not exist`);
    res.status(400).json({ message: "Order does not exist" });
    return;
  }
  console.log(req.body);
  if (req.body.payment.total.paidAmount < req.body.payment.total.totalAmount) {
    console.log(
      `Paid amount(${req.body.payment.total.paidAmount}) cannot be less than the total amount(${req.body.payment.total.totalAmount})`
    );
    res
      .status(400)
      .json({ message: "Paid amount cannot be less than the total amount" });
    return;
  }

  order.payment = req.body.payment;
  order.payment.status = "PAID";

  const savedOrder = await order.save();

  res.json(savedOrder);
});

router.post("/update-status/:orderNum", async (req, res, next) => {
  let orderNum = req.params.orderNum.split("-");
  orderNum =
    orderNum[0] +
    "/" +
    orderNum[1] +
    "-" +
    orderNum[2] +
    "-" +
    orderNum[3] +
    "/" +
    orderNum[4];
  const order = await Order.findOne({ orderNum: orderNum });
  if (!order) {
    console.log(`Order ${orderNum} does not exist`);
    res.status(400).json({ message: "Order does not exist" });
    return;
  }

  order.orderStatus = req.body.orderStatus;

  const savedOrder = await order.save();

  res.json(savedOrder);
});

module.exports = router;
