import { Modal } from "antd";
import "./OrderDetailsModalPage.css";
import { CurrencyFormatterIDR } from "../utility/CurrencyFormatter";
import { TimeFormatter } from "../utility/TimeFormatter";

function OrderDetailsModalPage({ isModalOpen, setIsModalOpen, orderData }) {
  function closeModal() {
    setIsModalOpen(false);
  }

  const {
    orderNum,
    orderStatus,
    tableName,
    customerName,
    orderList,
    payment,
    createdAt,
    updatedAt,
  } = orderData ?? {};

  return (
    <Modal
      open={isModalOpen}
      onCancel={closeModal}
      centered
      footer={false}
      title="Order Details"
    >
      <div className="order-details-modal-container">
        <p>Order Number : {orderNum && <b>{orderNum}</b>}</p>
        <p>Order Status : {orderStatus && <b>{orderStatus}</b>}</p>
        <p>Table Name : {tableName && <b>{tableName}</b>}</p>
        <p>Customer Name : {customerName && <b>{customerName}</b>}</p>
        <p>Created at : {createdAt && <b>{TimeFormatter(createdAt)}</b>}</p>
        <p>Updated at : {updatedAt && <b>{TimeFormatter(updatedAt)}</b>}</p>
        <span>Order List</span>
        <hr />
        <div className="order-item-titles">
          <span className="order-item-qty">Qty</span>
          <span className="order-item-name">Name</span>
          <span className="order-item-price">Price</span>
        </div>
        {orderList &&
          orderList.map((item) => (
            <div key={item.name}>
              <div className="order-item-details">
                <span className="order-item-qty">{item.qty}x</span>
                <span className="order-item-name">{item.name}</span>
                <span className="order-item-price">
                  {CurrencyFormatterIDR(item.price * item.qty)}
                </span>
              </div>
              {item.notes ? `Notes : ${item.notes}` : ""}
            </div>
          ))}
        <hr /> <p/>
        <span>Payment Details</span>
        <hr />
        <div className="payment-details">
          <span>
            Payment Status : {payment?.status && <b>{payment?.status}</b>}
          </span>
          <span>Payment Type : {payment?.type && <b>{payment?.type}</b>}</span>

          {payment?.isMerged ? (
            <span>
              Merged Payment :<br />
              {payment?.total?.mergedPayment.map((item) => (
                <div className="merged-payment-details" key={item.orderNum}>
                  <span>
                    {item.orderNum === orderNum
                      ? item.orderNum + "*"
                      : item.orderNum}
                  </span>
                  <span>{CurrencyFormatterIDR(item.subtotal)}</span>
                </div>
              ))}
            </span>
          ) : (
            <span>
              Subtotal :{" "}
              {payment?.total?.subtotal >= 0 && (
                <b>{CurrencyFormatterIDR(payment?.total?.subtotal)}</b>
              )}
            </span>
          )}
          <span>
            Tax :{" "}
            {payment?.total?.tax >= 0 && (
              <b>{CurrencyFormatterIDR(payment?.total?.tax)}</b>
            )}
          </span>
          <span>
            Service Charges :{" "}
            {payment?.total?.serviceCharges >= 0 && (
              <b>{CurrencyFormatterIDR(payment?.total?.serviceCharges)}</b>
            )}
          </span>
          <span>
            Discount{" "}
            {payment?.total?.discount?.type &&
              `(${payment?.total?.discount?.type})`}{" "}
            :{" "}
            {payment?.total?.discount?.amount >= 0 && (
              <b>
                {payment?.total?.discount?.type === "Percentage"
                  ? payment?.total?.discount?.amount + "%"
                  : CurrencyFormatterIDR(payment?.total?.discount?.amount)}
              </b>
            )}
          </span>
          <span>
            Total :{" "}
            {payment?.total?.totalAmount >= 0 && (
              <b>{CurrencyFormatterIDR(payment?.total?.totalAmount)}</b>
            )}
          </span>
          <span>
            Paid Amount :{" "}
            {payment?.total?.paidAmount >= 0 && (
              <b>{CurrencyFormatterIDR(payment?.total?.paidAmount)}</b>
            )}
          </span>
          <span>
            Changes :{" "}
            {payment?.total?.changes >= 0 && (
              <b>{CurrencyFormatterIDR(payment?.total?.changes)}</b>
            )}
          </span>
        </div>
        <hr />
      </div>
    </Modal>
  );
}

export default OrderDetailsModalPage;
