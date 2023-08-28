import { Modal, Button } from "antd";
import "./TableModalPage.css";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";

function TableModalPage({
  isModalOpen,
  setIsModalOpen,
  table,
  setTable,
  customerName,
  setCustomerName,
}) {
  const tablesData = useSelector((state) => state.tables);

  const [chosenTable, setChosenTable] = useState(table);
  const [chosenCustomerName, setChosenCustomerName] = useState(customerName);

  function closeModal() {
    setIsModalOpen(false);
    setChosenTable(table);
    setChosenCustomerName(customerName);
  }

  function handleSave() {
    setIsModalOpen(false);
    setTable(chosenTable);
    setCustomerName(chosenCustomerName);
  }

  useEffect(() => {
    setChosenTable(table);
    setChosenCustomerName(customerName);
  }, [table, customerName]);
  return (
    <Modal
      open={isModalOpen}
      onCancel={closeModal}
      centered
      footer={false}
      title="Select Table"
      bodyStyle={{ height: "85vh" }}
    >
      <div className="table-custom-modal-container">
        <div className="table-list">
          {[...tablesData]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((item) => (
              <div
                className={
                  chosenTable === item.name ? "chosen-table-card" : "table-card"
                }
                key={item.name}
                onClick={() => setChosenTable(item.name)}
              >
                <p className="table-name">{item.name}</p>
              </div>
            ))}
        </div>
      </div>
      <div className="table-custom-modal-footer">
        <input
          className="customer-name-input"
          placeholder="Customer Name (optional)"
          value={chosenCustomerName}
          onChange={(e) => setChosenCustomerName(e.target.value)}
        ></input>
        <div className="btn-container">
          <Button type="primary" onClick={handleSave}>
            Save
          </Button>
          <Button onClick={closeModal}>Cancel</Button>
        </div>
      </div>
    </Modal>
  );
}

export default TableModalPage;
