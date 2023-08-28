import "./Header.css";
import { Select } from "antd";
import SettingsIcon from "@mui/icons-material/Settings";
import { IconButton } from "@mui/material";
import { useState } from "react";
import SettingsModalPage from "./SettingsModalPage";

function Header({
  orderType,
  setOrderType,
  maxWaitingTime,
  setMaxWaitingTime,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="header-container">
      <SettingsModalPage
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        maxWaitingTime={maxWaitingTime}
        setMaxWaitingTime={setMaxWaitingTime}
      />
      <p className="title">
        POSvibe<sup className="sub-title">KDS</sup>
      </p>
      <Select
        style={{ width: 135 }}
        value={orderType}
        options={[
          { value: "activeOrders", label: "Active Orders" },
          { value: "pastOrders", label: "Past Orders" },
        ]}
        onChange={(value) => setOrderType(value)}
      />
      <IconButton onClick={() => setIsModalOpen(true)}>
        <SettingsIcon />
      </IconButton>
    </div>
  );
}

export default Header;
