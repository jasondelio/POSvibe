import "./OrderSidebar.css";
import { Button, Select, InputNumber, Modal } from "antd";
import OrderItem from "./OrderItem";
import SettingsIcon from "@mui/icons-material/Settings";
import { CurrencyFormatterIDR } from "../utility/CurrencyFormatter";
import { useState, useEffect } from "react";
import PaymentSettingsModalPage from "./PaymentSettingsModalPage";
import { useNavigate } from "react-router-dom";
import { socket } from "../Socket";

function OrderSidebar({
  orderList,
  setOrderList,
  showNotification,
  table,
  setTable,
  customerName,
  setCustomerName,
  layout,
  chosenOrdersData,
}) {
  const navigate = useNavigate();
  const [subtotal, setSubtotal] = useState(0);
  const [taxPercentage, setTaxPercentage] = useState(11);
  const [serviceChargesPercentage, setServiceChargesPercentage] = useState(0);
  const [discountType, setDiscountType] = useState("Fixed Amount");
  const [discountValue, setDiscountValue] = useState(0);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paidAmount, setPaidAmount] = useState(0);
  const [changes, setChanges] = useState(0);
  const { confirm } = Modal;

  useEffect(() => {
    const subtotalAmount = orderList.reduce(
      (total, item) => total + item.price * item.qty,
      0
    );
    let totalAmount =
      subtotalAmount +
      (taxPercentage / 100) * subtotalAmount +
      (serviceChargesPercentage / 100) * subtotalAmount;
    if (discountType === "Percentage") {
      totalAmount = totalAmount - (discountValue / 100) * totalAmount;
    } else {
      totalAmount = totalAmount - discountValue;
    }
    setSubtotal(subtotalAmount);
    setTotal(totalAmount);
    setPaidAmount(totalAmount);
  }, [
    orderList,
    taxPercentage,
    serviceChargesPercentage,
    discountType,
    discountValue,
  ]);

  useEffect(() => {
    setChanges(paidAmount - total);
  }, [paidAmount, total]);

  useEffect(() => {
    if (localStorage.getItem("taxPercentage")) {
      setTaxPercentage(localStorage.getItem("taxPercentage"));
    }
    if (localStorage.getItem("serviceChargesPercentage")) {
      setServiceChargesPercentage(
        localStorage.getItem("serviceChargesPercentage")
      );
    }
  }, []);

  function sendOrderDataToKDS(orderData) {
    return new Promise((resolve, reject) => {
      socket.emit(
        "sendOrderData",
        {
          orderNum: orderData.orderNum,
          tableName: orderData.tableName,
          customerName: orderData.customerName,
          orderList: orderData.orderList,
          orderStatus: orderData.orderStatus,
          createdAt: orderData.createdAt,
        },
        (response) => {
          resolve(response); // Resolve the promise with the response
        }
      );
    });
  }

  function handleChangeOrder() {
    return new Promise((resolve, reject) => {
      socket.emit(
        "updateOrderData",
        {
          orderNum: chosenOrdersData[0].orderNum,
          orderList: orderList,
          tableName: table,
          customerName: customerName,
          payment: {
            status: chosenOrdersData[0].payment.status,
            type: chosenOrdersData[0].payment.type,
            isMerged: chosenOrdersData[0].payment.isMerged,
            total: {
              subtotal: subtotal,
              mergedPayment: chosenOrdersData[0].payment.total.mergedPayment,
              tax: (taxPercentage / 100) * subtotal,
              serviceCharges: (serviceChargesPercentage / 100) * subtotal,
              discount: {
                type: discountType,
                amount: discountValue,
              },
              totalAmount: total,
              paidAmount: chosenOrdersData[0].payment.total.paidAmount,
              changes: chosenOrdersData[0].payment.total.changes,
            },
          },
          orderStatus: chosenOrdersData[0].orderStatus,
        },
        (response) => {
          resolve(response); // Resolve the promise with the response
        }
      );
    });
  }

  function showModal() {
    setIsModalOpen(true);
  }

  function handleClearAll() {
    setOrderList([]);
    setDiscountType("Fixed Amount");
    setDiscountValue(0);
    setTable("");
    setCustomerName("");
  }

  function handleResetAll() {
    const chosenOrder = chosenOrdersData[0];
    const clonedOrderList = chosenOrder.orderList.map((item) => ({
      ...item,
    }));
    setOrderList(clonedOrderList);
    setTable(chosenOrder.tableName);
    setCustomerName(chosenOrder.customerName);
  }

  function handlePlaceOrder() {
    if (!socket.connected) {
      showNotification(
        "error",
        "Error",
        "The Kitchen Display System is currently offline, please try again or contact your administrator."
      );
    } else {
      (async () => {
        try {
          const res = await fetch(
            `${process.env.REACT_APP_SERVER_URL}/api/v1/order`,
            {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderList: orderList,
                tableName: table,
                customerName: customerName,
                payment: {
                  total: {
                    subtotal: subtotal,
                    tax: (taxPercentage / 100) * subtotal,
                    serviceCharges: (serviceChargesPercentage / 100) * subtotal,
                    discount: {
                      type: discountType,
                      amount: discountValue,
                    },
                    totalAmount: total,
                  },
                },
              }),
            }
          );
          try {
            const socketReponse = await sendOrderDataToKDS(await res.json());
            if (socketReponse.status !== "ok") {
              throw new Error("Error from socket io");
            }
          } catch (err) {
            throw new Error(err.message);
          }

          if (res.status === 200) {
            showNotification(
              "success",
              "Success",
              "The order has been placed."
            );
            handleClearAll();
            navigate("/home");
          } else {
            throw new Error("API Error");
          }
        } catch (err) {
          showNotification(
            "error",
            "Error",
            "There is something wrong, please try again or contact your administrator."
          );
        }
      })();
    }
  }

  async function handlePayOrder() {
    const mergedPayment = chosenOrdersData.map((data) => {
      return { orderNum: data.orderNum, subtotal: data.payment.total.subtotal };
    });

    try {
      const promises = chosenOrdersData.map(async (data) => {
        const res = await fetch(
          `${
            process.env.REACT_APP_SERVER_URL
          }/api/v1/order/make-payment/${data.orderNum.replaceAll("/", "-")}`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              payment: {
                status: "PAID",
                type: paymentMethod,
                isMerged: chosenOrdersData.length > 1,
                total: {
                  subtotal: data.payment.total.subtotal,
                  mergedPayment:
                    chosenOrdersData.length > 1 ? mergedPayment : [],
                  tax: (taxPercentage / 100) * subtotal,
                  serviceCharges: (serviceChargesPercentage / 100) * subtotal,
                  discount: {
                    type: discountType,
                    amount: discountValue,
                  },
                  totalAmount: total,
                  paidAmount: paidAmount,
                  changes: changes,
                },
              },
              orderStatus: data.orderStatus,
            }),
          }
        );

        if (res.status === 200) {
          showNotification(
            "success",
            "Success",
            `The order number ${data.orderNum} has been paid.`
          );
          return true;
        } else {
          showNotification(
            "error",
            "Error",
            "There is something wrong, please try again or contact your administrator."
          );
          return false;
        }
      });

      const results = await Promise.all(promises);

      // Check if all API calls were successful or not and perform further actions if needed.
      if (results.every((result) => result)) {
        handleClearAll();
        setTable("");
        setCustomerName("");
        navigate("/home");
      }
    } catch (err) {
      showNotification(
        "error",
        "Error",
        "There is something wrong, please try again or contact your administrator."
      );
    }
  }

  function handlePaymentMethodChange(value) {
    setPaymentMethod(value);
    if (value !== "Cash") {
      setPaidAmount(total);
    }
  }

  function handlePaidAmountChange(value) {
    setPaidAmount(value);
    if (value === null) {
      setPaidAmount(total);
    }
  }

  function showPlaceOrderConfirm() {
    confirm({
      title: "Place Order",
      content: "Are you sure want to place order?",
      centered: true,
      okText: "Yes",
      cancelText: "No",
      onOk: () => {
        handlePlaceOrder();
      },
    });
  }

  function showChangeOrderConfirm() {
    confirm({
      title: "Change Order",
      content: "Are you sure want to change order?",
      centered: true,
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        if (!socket.connected) {
          showNotification(
            "error",
            "Error",
            "The Kitchen Display System is currently offline, please try again or contact your administrator."
          );
        } else {
          try {
            const socketResponse = await handleChangeOrder();
            if (socketResponse.status === "ok") {
              showNotification(
                "success",
                "Success",
                "The order has been changed."
              );

              handleClearAll();
              setTable("");
              setCustomerName("");
              navigate("/home");
            } else {
              throw new Error("Error from socket io");
            }
          } catch (err) {
            showNotification(
              "error",
              "Error",
              "There is something wrong, please try again or contact your administrator."
            );
          }
        }
      },
    });
  }

  function showPayOrderConfirm() {
    confirm({
      title: "Pay Order",
      content: "Are you sure want to pay order?",
      centered: true,
      okText: "Yes",
      cancelText: "No",
      onOk: () => {
        handlePayOrder();
      },
    });
  }

  function isOrderListSame() {
    if (chosenOrdersData[0].orderList.length !== orderList.length) {
      return false;
    }

    return (
      JSON.stringify(chosenOrdersData[0].orderList.sort()) ===
      JSON.stringify(orderList.sort())
    );
  }

  return (
    <div className="order-sidebar-container">
      <PaymentSettingsModalPage
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        taxPercentage={taxPercentage}
        setTaxPercentage={setTaxPercentage}
        serviceChargesPercentage={serviceChargesPercentage}
        setServiceChargesPercentage={setServiceChargesPercentage}
        discountType={discountType}
        setDiscountType={setDiscountType}
        discountValue={discountValue}
        setDiscountValue={setDiscountValue}
        total={total}
        subtotal={subtotal}
      />
      <div className="top-container">
        <p className="current-order-text">Current Order</p>
        <div className="button-container">
          {layout === "change-order" ? (
            <div className="clear-button">
              <Button type="primary" onClick={handleResetAll}>
                Reset All
              </Button>
            </div>
          ) : layout === "payment" ? (
            <></>
          ) : (
            <div className="clear-button">
              <Button type="primary" onClick={handleClearAll}>
                Clear All
              </Button>
            </div>
          )}

          <div className="setting-button">
            <Button
              type="primary"
              icon={<SettingsIcon />}
              onClick={showModal}
            />
          </div>
        </div>
      </div>
      <div className="order-list-container">
        {orderList.map((item, index) => (
          <OrderItem
            key={item.name}
            orderList={orderList}
            setOrderList={setOrderList}
            index={index}
            layout={layout}
          />
        ))}
      </div>
      <div className="footer-container">
        <div className="payment-details-container">
          <div className="payment-details-item">
            <span>Subtotal</span>
            <b>
              <span>{CurrencyFormatterIDR(subtotal)}</span>
            </b>
          </div>
          {taxPercentage > 0 && (
            <div className="payment-details-item">
              <span>Tax</span>
              <b>
                <span>
                  {CurrencyFormatterIDR((taxPercentage / 100) * subtotal)}
                </span>
              </b>
            </div>
          )}
          {serviceChargesPercentage > 0 && (
            <div className="payment-details-item">
              <span>Service Charges</span>
              <b>
                <span>
                  {CurrencyFormatterIDR(
                    (serviceChargesPercentage / 100) * subtotal
                  )}
                </span>
              </b>
            </div>
          )}
          {discountValue > 0 && (
            <div className="payment-details-item">
              <span>Discount</span>
              <b>
                <span>
                  {discountType === "Percentage"
                    ? CurrencyFormatterIDR(
                        (discountValue / 100) *
                          (subtotal +
                            (taxPercentage / 100) * subtotal +
                            (serviceChargesPercentage / 100) * subtotal)
                      )
                    : CurrencyFormatterIDR(discountValue)}
                </span>
              </b>
            </div>
          )}
          <div className="payment-details-item">
            <span>Total</span>
            <b>
              <span>{CurrencyFormatterIDR(total)}</span>
            </b>
          </div>
        </div>
        {layout === "payment" && (
          <div className="payment-details-container">
            <div className="payment-details-item">
              <span>Payment Method</span>
              <Select
                style={{ width: 130 }}
                defaultValue={paymentMethod}
                onChange={handlePaymentMethodChange}
                options={[
                  {
                    value: "Cash",
                    label: "Cash",
                  },
                  {
                    value: "QRIS",
                    label: "QRIS",
                  },
                  {
                    value: "Credit Card",
                    label: "Credit Card",
                  },
                  {
                    value: "Debit Card",
                    label: "Debit Card",
                  },
                ]}
              />
            </div>
            <div className="payment-details-item">
              <span>Paid Amount</span>
              {paymentMethod === "Cash" ? (
                <InputNumber
                  style={{ width: 130 }}
                  min={total}
                  step={1000}
                  value={paidAmount}
                  onChange={handlePaidAmountChange}
                />
              ) : (
                <span>{CurrencyFormatterIDR(paidAmount)}</span>
              )}
            </div>
            <div className="payment-details-item">
              <span>Changes</span>
              <span>{CurrencyFormatterIDR(changes)}</span>
            </div>
          </div>
        )}
        {layout === "change-order" ? (
          <Button
            className="change-order-btn"
            type="primary"
            disabled={
              orderList.length === 0 ||
              table === "" ||
              (isOrderListSame() &&
                table === chosenOrdersData[0]?.tableName &&
                customerName === chosenOrdersData[0]?.customerName)
            }
            onClick={showChangeOrderConfirm}
          >
            Change Order
          </Button>
        ) : layout === "payment" ? (
          <Button
            className="pay-order-btn"
            type="primary"
            disabled={orderList.length === 0}
            onClick={showPayOrderConfirm}
          >
            Pay Order
          </Button>
        ) : (
          <Button
            className="place-order-btn"
            type="primary"
            disabled={orderList.length === 0 || table === ""}
            onClick={showPlaceOrderConfirm}
          >
            Place Order
          </Button>
        )}
      </div>
    </div>
  );
}

export default OrderSidebar;
