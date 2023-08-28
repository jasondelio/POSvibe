import "./Header.css";
import { Button, Input } from "antd";
import { useState } from "react";
import TableModalPage from "../components/TableModalPage";

function Header({
  isOnlyTitle,
  table,
  setTable,
  customerName,
  setCustomerName,
  setInputSearch
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempTable, setTempTable] = useState(table);
  const [tempCustomerName, setTempCustomerName] = useState(customerName);

  function showModal() {
    setIsModalOpen(true);
    setTempTable(table);
    setTempCustomerName(customerName);
  }

  return (
    <div className="header-container">
      {isOnlyTitle ? (
        <p className="title">POSvibe</p>
      ) : (
        <>
          <TableModalPage
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            table={table}
            setTable={setTable}
            customerName={customerName}
            setCustomerName={setCustomerName}
          />
          <p className="title">POSvibe</p>
          <Input
            allowClear
            placeholder="Type here to search..."
            style={{
              width: "200px",
            }}
            onChange={(e) => setInputSearch(e.target.value)}
          />
          <div className="table-details-container">
            <Button type="primary" onClick={showModal}>
              Select Table
            </Button>
            {table && !isModalOpen ? (
              <span>
                Table: {table}
                {customerName ? " - " + customerName : ""}
              </span>
            ) : tempTable && isModalOpen ? (
              <span>
                Table: {tempTable}
                {tempCustomerName ? " - " + tempCustomerName : ""}
              </span>
            ) : (
              <></>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Header;
