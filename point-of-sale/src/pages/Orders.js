import Header from "../components/Header";
import MenuSidebar from "../components/MenuSidebar";
import "./Orders.css";
import { DataGrid } from "@mui/x-data-grid";
import { Button, Input, Modal, notification, Spin, Dropdown } from "antd";
import { Box } from "@mui/material";
import Title from "../components/Title";
import { useState, useEffect } from "react";
import { useOrders } from "../Api";
import Error from "../components/Error";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import OrderDetailsModalPage from "../components/OrderDetailsModalPage";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { socket } from "../Socket";

function Orders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [reloadData, setReloadData] = useState(false);
  const { ordersData, ordersLoading, ordersApiError } = useOrders(reloadData);
  const { confirm } = Modal;
  const [api, contextHolder] = notification.useNotification();
  const [filteredOrdersData, setFilteredOrdersData] = useState(null);
  const [inputSearch, setInputSearch] = useState(null);
  const [isSearch, setIsSearch] = useState(false);
  const [preProcessedData, setPreProcessedData] = useState(ordersData);
  const [selectionModel, setSelectionModel] = useState([]);
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
  const [chosenOrder, setChosenOrder] = useState(null);

  const columns = [
    { field: "orderNum", headerName: "Order Number", flex: 1 },
    {
      field: "tableName",
      headerName: "Table Name",
      flex: 1,
    },
    {
      field: "customerName",
      headerName: "Customer Name",
      flex: 1,
    },
    {
      field: "paymentStatus",
      headerName: "Payment Status",
      flex: 1,
      renderCell: (params) => {
        return (
          <span
            style={{
              color:
                params.row.payment.status === "UNPAID" ? "#f5222d" : "#52c41a",
            }}
          >
            {params.row.payment.status}
          </span>
        );
      },
    },
    {
      field: "orderStatus",
      headerName: "Order Status",
      flex: 1,
      renderCell: (params) => {
        return (
          <span
            style={{
              color:
                params.value === "PENDING"
                  ? "#fa8c16"
                  : params.value === "IN KITCHEN"
                  ? "#1677ff"
                  : params.value === "CANCELLED"
                  ? "#f5222d"
                  : params.value === "READY TO SERVE"
                  ? "#722ed1"
                  : "#52c41a",
            }}
          >
            {params.value}
          </span>
        );
      },
    },
    {
      field: "actions",
      type: "actions",
      flex: 0.2,
      renderCell: (params) => {
        return (
          <Dropdown
            menu={{
              items: params.row.actions,
              onClick: (e) => handleMenuClick(e, params),
            }}
            trigger={["click"]}
          >
            <Button type="text" icon={<MoreVertIcon />} />
          </Dropdown>
        );
      },
    },
  ];

  useEffect(() => {
    socket.on("getUpdatedOrderData", handleReloadData);

    return () => {
      socket.off("getUpdatedOrderData", handleReloadData);
    };
  }, []);

  useEffect(() => {
    if (inputSearch !== null && inputSearch.trim() !== "") {
      const inputRegex = new RegExp(inputSearch, "i");
      const inputRegexOrderNum = new RegExp(`^${inputSearch}`, "i");
      setFilteredOrdersData(
        preProcessedData.filter(
          (item) =>
            inputRegex.test(item.tableName) ||
            inputRegex.test(item.customerName) ||
            inputRegexOrderNum.test(item.orderNum)
        )
      );
      setIsSearch(true);
    } else {
      setIsSearch(false);
    }
  }, [inputSearch, preProcessedData]);

  useEffect(() => {
    const newData = ordersData.map((item) => ({
      ...item,
      actions: [
        {
          key: "1",
          label: "View Details",
        },
        {
          key: "2",
          label: "Change Order",
          disabled:
            item.orderStatus !== "PENDING" || item.payment.status === "PAID",
        },
        {
          key: "3",
          label: "Cancel Order",
          danger: true,
          disabled:
            item.orderStatus !== "PENDING" || item.payment.status === "PAID",
        },
      ],
    }));

    setPreProcessedData(newData);
  }, [ordersData]);

  function handleReloadData() {
    setReloadData((prevState) => !prevState);
  }

  function handleSelectionChange(newSelection) {
    setSelectionModel(newSelection);
  }

  function handleMenuClick(e, params) {
    if (e.key === "1") {
      setChosenOrder(params.row);
      setIsViewDetailsModalOpen(true);
    } else if (e.key === "2") {
      showChangeOrderConfirm(params.row);
    } else if (e.key === "3") {
      showCancelOrderConfirm(params.row.orderNum);
    }
  }

  function showNotification(type, message, description) {
    api[type]({
      message: message,
      description: description,
    });
  }

  function showCancelOrderConfirm(orderNum) {
    confirm({
      title: "Cancel Order",
      content: "Are you sure want to cancel this order?",
      centered: true,
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          if (!socket.connected) {
            showNotification(
              "error",
              "Error",
              "The Kitchen Display System is currently offline, please try again or contact your administrator."
            );
          } else {
            const socketResponse = await handleCancelOrder(orderNum);
            if (socketResponse.status === "ok") {
              showNotification(
                "success",
                "Success",
                "The order is successfully cancelled."
              );
            } else {
              throw new Error("Error from socket io");
            }
          }
        } catch (err) {
          showNotification(
            "error",
            "Error",
            "There is something wrong, please try again or contact your administrator."
          );
        }
      },
    });
  }

  function showChangeOrderConfirm(orderData) {
    confirm({
      title: "Change Order",
      content: "Are you sure want to change this order?",
      centered: true,
      okText: "Yes",
      cancelText: "No",
      onOk: () => {
        dispatch({ type: "FETCH_CHOSEN_ORDERS", data: [orderData] });
        navigate("/change-order");
      },
    });
  }

  function showMakePaymentConfirm() {
    confirm({
      title: selectionModel.length === 1 ? "Single Payment" : "Merge Payment",
      content:
        selectionModel.length === 1 ? (
          <span>
            Are you sure want to make single payment for this order number{" "}
            <strong>{selectionModel[0]}</strong>?
          </span>
        ) : (
          <span>
            Are you sure want to merge payment for these order numbers{" "}
            <strong>{selectionModel.join(", ")}</strong>?
          </span>
        ),
      centered: true,
      okText: "Yes",
      cancelText: "No",
      onOk: () => {
        handleMakePayment();
      },
    });
  }

  function handleMakePayment() {
    dispatch({
      type: "FETCH_CHOSEN_ORDERS",
      data: ordersData.filter((order) =>
        selectionModel.includes(order.orderNum)
      ),
    });
    navigate("/payment");
  }

  function handleCancelOrder(orderNum) {
    return new Promise((resolve, reject) => {
      socket.emit(
        "updateOrderStatus",
        { orderNum: orderNum, orderStatus: "CANCELLED" },
        (response) => {
          resolve(response);
        }
      );
    });
  }

  return (
    <div className="orders-container">
      {contextHolder}
      <Header isOnlyTitle={true} />
      <div className="orders-main-container">
        <MenuSidebar page="Orders" />
        <div className="orders-main-content">
          {ordersLoading ? (
            <div className="loader-container">
              <Spin size="large" />
            </div>
          ) : ordersApiError !== null ? (
            <Error message="The server encountered an error and could not complete your request, please contact your administrator." />
          ) : (
            <>
              <OrderDetailsModalPage
                isModalOpen={isViewDetailsModalOpen}
                setIsModalOpen={setIsViewDetailsModalOpen}
                orderData={chosenOrder}
              />
              <div className="header-orders-container">
                <Title name="Orders" />
                <Button
                  type="primary"
                  disabled={selectionModel.length === 0}
                  onClick={showMakePaymentConfirm}
                >
                  Make Payment
                </Button>
              </div>
              <Input
                placeholder="Type here to search..."
                onChange={(e) => setInputSearch(e.target.value)}
                allowClear
                style={{
                  width: "100%",
                  marginBottom: "10px",
                }}
              />
              <Box
                sx={{
                  height: "80%",
                  width: "100%",
                }}
              >
                <DataGrid
                  sx={{
                    "& .MuiDataGrid-cell": {
                      paddingTop: "10px",
                      paddingBottom: "10px",
                    },
                    "& .MuiDataGrid-root": {
                      border: "none",
                    },
                    "& .MuiDataGrid-columnHeaders": {
                      backgroundColor: "#595959",
                      color: "white",
                    },
                    "& .MuiDataGrid-virtualScroller": {
                      backgroundColor: "white",
                    },
                    "& .MuiDataGrid-footerContainer": {
                      borderTop: "none",
                      backgroundColor: "white",
                    },
                  }}
                  rows={!isSearch ? preProcessedData : filteredOrdersData}
                  columns={columns}
                  autoPageSize={true}
                  getRowId={(row) => row.orderNum}
                  checkboxSelection
                  disableRowSelectionOnClick
                  onRowSelectionModelChange={handleSelectionChange}
                  rowSelectionModel={selectionModel}
                  isRowSelectable={(params) =>
                    params.row.payment.status === "UNPAID" &&
                    params.row.orderStatus !== "CANCELLED"
                  }
                />
              </Box>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Orders;
