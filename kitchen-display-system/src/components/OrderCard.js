import "./OrderCard.css";
import { TimeFormatter } from "../utility/TimeFormatter";
import { useStopwatch } from "react-timer-hook";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import Checkbox from "@mui/material/Checkbox";
import { useState } from "react";

function OrderCard({ height, orderData, socket, maxWaitingTime }) {
  const [checkedItems, setCheckedItems] = useState({});

  const initialDuration = Math.floor(
    (new Date() - new Date(orderData.createdAt)) / 1000
  );
  const stopwatchOffset = new Date();
  stopwatchOffset.setSeconds(stopwatchOffset.getSeconds() + initialDuration);

  const { totalSeconds, seconds, minutes, hours } = useStopwatch({
    autoStart: true,
    offsetTimestamp: stopwatchOffset,
  });

  const formattedStopwatch = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  function updateOrderStatus(status) {
    orderData.orderStatus = status;
    console.log(formattedStopwatch);
    socket.emit("updateOrderStatus", orderData, formattedStopwatch, (response) => {
      console.log(response.status); // ok
    });
  }

  function handleCheckboxChange(itemName) {
    setCheckedItems((prevCheckedItems) => ({
      ...prevCheckedItems,
      [itemName]: !prevCheckedItems[itemName],
    }));
  }

  return (
    <div className="order-card-container" style={{ height: height + "px" }}>
      <div
        className="order-card-header"
        style={{
          backgroundColor:
            orderData.orderStatus === "PENDING"
              ? "#d48806"
              : orderData.orderStatus === "IN KITCHEN"
              ? "#303f9f"
              : orderData.orderStatus === "READY TO SERVE"
              ? "#237804"
              : "#434343",
          animation:
            maxWaitingTime * 60 < totalSeconds &&
            orderData.orderStatus !== "COMPLETED"
              ? "blink 1s infinite"
              : "none",
        }}
      >
        <div className="order-card-header-item-container">
          <span>
            <span>#{orderData.orderNum}</span>
          </span>
          <span className="order-card-header-item">
            <AccessTimeIcon style={{ fontSize: "18px" }} />
            {TimeFormatter(orderData.createdAt, "Asia/Jakarta")}
          </span>
        </div>
        <div className="order-card-header-item-container">
          Table: {orderData.tableName}
          {orderData.customerName && `-${orderData.customerName}`}
          <span className="order-card-header-item">
            <HourglassTopIcon style={{ fontSize: "18px" }} />
            <span>{orderData.orderStatus === "COMPLETED" ? orderData.totalTime : formattedStopwatch}</span>
          </span>
        </div>
      </div>
      <div className="order-card-order-list">
        {orderData.orderList.map((item) => {
          const isChecked = checkedItems[item.name];
          return (
            <div className="order-item" key={item.name}>
              <div
                className={`order-sub-item ${
                  isChecked ? "order-sub-item-checked" : ""
                }`}
              >
                <div className="order-qty">{item.qty}</div>
                <div className="order-details">
                  <span className="order-name">{item.name}</span>
                  <span className="order-notes">{item.notes}</span>
                </div>
              </div>
              {orderData.orderStatus === "IN KITCHEN" && (
                <Checkbox
                  color="success"
                  checked={isChecked}
                  onChange={() => handleCheckboxChange(item.name)}
                />
              )}
            </div>
          );
        })}
      </div>
      {orderData.orderStatus === "PENDING" && (
        <button
          onClick={() => updateOrderStatus("IN KITCHEN")}
          className="action-btn"
          style={{ backgroundColor: "#237804" }}
        >
          START ORDER
        </button>
      )}
      {orderData.orderStatus === "IN KITCHEN" && (
        <button
          onClick={() => updateOrderStatus("READY TO SERVE")}
          className="action-btn"
          style={{ backgroundColor: "#d48806" }}
        >
          MARK AS READY
        </button>
      )}
      {orderData.orderStatus === "READY TO SERVE" && (
        <button
          onClick={() => updateOrderStatus("COMPLETED")}
          className="action-btn"
          style={{ backgroundColor: "#434343" }}
        >
          SERVE ORDER
        </button>
      )}
    </div>
  );
}

export default OrderCard;
