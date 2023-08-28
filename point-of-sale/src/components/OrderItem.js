import { useState, useEffect } from "react";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { CaretRightFilled, CaretDownFilled } from "@ant-design/icons";
import { Button, Input } from "antd";
import "./OrderItem.css";
import { CurrencyFormatterIDR } from "../utility/CurrencyFormatter";

function OrderItem({ orderList, setOrderList, index, layout }) {
  const [qtyValue, setQtyValue] = useState(orderList[index].qty);
  const [isOpenNotesField, setIsOpenNotesField] = useState(!!orderList[index].notes);
  const [notes, setNotes] = useState(orderList[index].notes);

  useEffect(() => {
    setQtyValue(orderList[index].qty);
  }, [orderList, index]);

  function increaseQuantity() {
    const updatedOrder = [...orderList];
    updatedOrder[index].qty += 1;
    setQtyValue(updatedOrder[index].qty);
    setOrderList(updatedOrder);
  }

  function decreaseQuantity() {
    const updatedOrder = [...orderList];
    updatedOrder[index].qty -= 1;
    setQtyValue(updatedOrder[index].qty);
    setOrderList(updatedOrder);
  }

  function removeItem() {
    const updatedOrder = [...orderList];
    updatedOrder.splice(index, 1);
    setOrderList(updatedOrder);
  }

  function handleChange(e) {
    const newValue = e.target.value;
    if (
      newValue === "" ||
      (parseInt(newValue, 10) <= 99 && parseInt(newValue, 10) >= 1)
    ) {
      setQtyValue(newValue);

      if (parseInt(newValue, 10) <= 99 && parseInt(newValue, 10) >= 1) {
        const updatedOrder = [...orderList];
        updatedOrder[index].qty = parseInt(newValue, 10);
        setOrderList(updatedOrder);
      }
    } else if (parseInt(newValue, 10) > 99) {
      setQtyValue(99);
      const updatedOrder = [...orderList];
      updatedOrder[index].qty = 99;
      setOrderList(updatedOrder);
    } else if (parseInt(newValue, 10) < 1) {
      setQtyValue(1);
      const updatedOrder = [...orderList];
      updatedOrder[index].qty = 1;
      setOrderList(updatedOrder);
    }
  }

  function handleBlur() {
    if (qtyValue === "") {
      setQtyValue(1);
      const updatedOrder = [...orderList];
      updatedOrder[index].qty = 1;
      setOrderList(updatedOrder);
    }
  }

  function handleInputChange(e) {
    setNotes(e.target.value);
    const updatedOrder = [...orderList];
    updatedOrder[index].notes = e.target.value;
    setOrderList(updatedOrder);
  }

  return (
    <div>
      <div className="order-item">
        {!isOpenNotesField ? (
          <CaretRightFilled
            style={{ cursor: "pointer" }}
            onClick={() => setIsOpenNotesField((prevState) => !prevState)}
          />
        ) : (
          <CaretDownFilled
            style={{ cursor: "pointer" }}
            onClick={() => setIsOpenNotesField((prevState) => !prevState)}
          />
        )}

        <p className="item-name">{orderList[index].name}</p>
        <div className="qty-btn-container">
          <Button
            type="primary"
            disabled={orderList[index].qty <= 1 || layout === "payment"}
            onClick={decreaseQuantity}
          >
            -
          </Button>
          <input
            className="item-qty"
            disabled={layout === "payment"}
            type="number"
            value={qtyValue}
            id="quantity"
            name="quantity"
            min="1"
            max="99"
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <Button type="primary" onClick={increaseQuantity} disabled={layout === "payment"}>
            +
          </Button>
        </div>
        <p className="item-price">
          {CurrencyFormatterIDR(orderList[index].qty * orderList[index].price)}
        </p>

        <HighlightOffIcon
          fontSize="small"
          style={{ cursor: "pointer", pointerEvents: layout === "payment" ? "none" : "" }}
          onClick={removeItem}
        />
      </div>
      {isOpenNotesField ? (
        <Input
          placeholder="Notes (optional)"
          value={notes}
          onChange={handleInputChange}
          disabled={layout === "payment"}
        />
      ) : (
        <></>
      )}
    </div>
  );
}

export default OrderItem;
