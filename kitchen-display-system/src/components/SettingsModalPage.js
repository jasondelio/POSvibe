import "./SettingsModalPage.css";
import { useState, useEffect } from "react";
import { Modal, InputNumber, Button } from "antd";

function SettingsModalPage({
  isModalOpen,
  setIsModalOpen,
  maxWaitingTime,
  setMaxWaitingTime,
}) {
  const [maxWaitingTimeInput, setMaxWaitingTimeInput] =
    useState(maxWaitingTime);

  useEffect(() => {
    setMaxWaitingTimeInput(maxWaitingTime);
  }, [maxWaitingTime]);
  
  function handleSave() {
    setMaxWaitingTime(maxWaitingTimeInput);
    localStorage.setItem("maxWaitingTime", maxWaitingTimeInput);
    setIsModalOpen(false);
  }
  return (
    <Modal
      open={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
      centered
      footer={false}
      title="Settings"
    >
      <div className="modal-main-content">
        <span>
          Max waiting time (in minutes):{" "}
          <InputNumber
            style={{ width: 70 }}
            min={0}
            value={maxWaitingTimeInput}
            onChange={(value) => setMaxWaitingTimeInput(value)}
          />
        </span>
      </div>
      <div className="modal-footer">
        <div className="btn-container">
          <Button type="primary" onClick={handleSave}>
            Save
          </Button>
          <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
        </div>
      </div>
    </Modal>
  );
}

export default SettingsModalPage;
