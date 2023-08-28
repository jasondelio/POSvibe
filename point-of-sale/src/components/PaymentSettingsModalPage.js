import { Modal, Button, InputNumber, Select } from "antd";
import "./PaymentSettingsModalPage.css";
import { useState, useEffect } from "react";

function PaymentSettingsModalPage({
  isModalOpen,
  setIsModalOpen,
  taxPercentage,
  setTaxPercentage,
  serviceChargesPercentage,
  setServiceChargesPercentage,
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue,
  subtotal,
}) {
  const [taxPercentageInput, setTaxPercentageInput] = useState(taxPercentage);
  const [serviceChargesPercentageInput, setServiceChargesPercentageInput] =
    useState(serviceChargesPercentage);
  const [discountTypeInput, setDiscountTypeInput] = useState(discountType);
  const [discountValueInput, setDiscountValueInput] = useState(discountValue);

  useEffect(() => {
    setTaxPercentageInput(taxPercentage);
  }, [taxPercentage]);

  useEffect(() => {
    setServiceChargesPercentageInput(serviceChargesPercentage);
  }, [serviceChargesPercentage]);

  useEffect(() => {
    setDiscountTypeInput(discountType);
    setDiscountValueInput(discountValue);
  }, [discountType, discountValue]);

  function closeModal() {
    setIsModalOpen(false);
    setTaxPercentageInput(taxPercentage);
    setServiceChargesPercentageInput(serviceChargesPercentage);
    setDiscountTypeInput(discountType);
    setDiscountValueInput(discountValue);
  }

  function handleSave() {
    setTaxPercentage(taxPercentageInput);
    setServiceChargesPercentage(serviceChargesPercentageInput);
    setDiscountType(discountTypeInput);
    setDiscountValue(discountValueInput);
    localStorage.setItem("taxPercentage", taxPercentageInput);
    localStorage.setItem(
      "serviceChargesPercentage",
      serviceChargesPercentageInput
    );
    setIsModalOpen(false);
  }

  function handleTaxPercentageChange(value) {
    if (value === null) {
      setTaxPercentageInput(taxPercentage);
    } else {
      setTaxPercentageInput(value);
    }
  }

  function handleServiceChargesPercentageChange(value) {
    if (value === null) {
      setServiceChargesPercentageInput(serviceChargesPercentage);
    } else {
      setServiceChargesPercentageInput(value);
    }
  }

  function handleDiscountTypeChange(value) {
    setDiscountTypeInput(value);
    setDiscountValueInput(0);
    if (value === discountType) {
      setDiscountValueInput(discountValue);
    }
  }

  function handleDiscountValueChange(value) {
    if (value === null) {
      setDiscountValueInput(discountValue);
    } else {
      setDiscountValueInput(value);
    }
  }

  return (
    <Modal
      open={isModalOpen}
      onCancel={closeModal}
      centered
      footer={false}
      title="Payment Settings"
      destroyOnClose={true}
    >
      <div className="payment-settings-custom-modal-container">
        <span>
          Tax Percentage:{" "}
          <InputNumber
            style={{ width: 70 }}
            min={0}
            max={100}
            value={taxPercentageInput}
            onChange={handleTaxPercentageChange}
          />
        </span>
        <span>
          Service Charges Percentage:{" "}
          <InputNumber
            style={{ width: 70 }}
            min={0}
            max={100}
            value={serviceChargesPercentageInput}
            onChange={handleServiceChargesPercentageChange}
          />
        </span>
        <span>
          Discount Type:{" "}
          <Select
            style={{ width: 130 }}
            defaultValue={discountType}
            options={[
              {
                value: "Fixed Amount",
                label: "Fixed Amount",
              },
              {
                value: "Percentage",
                label: "Percentage",
              },
            ]}
            onChange={handleDiscountTypeChange}
          />
        </span>
        <span>
          Discount Amount:{" "}
          <InputNumber
            style={{ width: discountTypeInput === "Percentage" ? 70 : 130 }}
            min={0}
            max={
              discountTypeInput === "Percentage"
                ? 100
                : subtotal +
                  (taxPercentageInput / 100) * subtotal +
                  (serviceChargesPercentageInput / 100) * subtotal
            }
            step={discountTypeInput === "Percentage" ? 1 : 1000}
            value={discountValueInput}
            onChange={handleDiscountValueChange}
          />
          {discountTypeInput === "Fixed Amount" && <span className="max-allowed-text">
            {" "}
            Max Allowed:{" "}
            {subtotal +
              (taxPercentageInput / 100) * subtotal +
              (serviceChargesPercentageInput / 100) * subtotal}
          </span>}
          
        </span>
      </div>
      <div className="payment-settings-modal-footer">
        <div className="btn-container">
          <Button
            type="primary"
            onClick={handleSave}
            disabled={
              discountValueInput >
              subtotal +
                (taxPercentageInput / 100) * subtotal +
                (serviceChargesPercentageInput / 100) * subtotal
            }
          >
            Save
          </Button>
          <Button onClick={closeModal}>Cancel</Button>
        </div>
      </div>
    </Modal>
  );
}

export default PaymentSettingsModalPage;
