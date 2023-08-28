import Header from "../components/Header";
import MenuSidebar from "../components/MenuSidebar";
import "./Tables.css";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { Button, Input, Modal, notification, Spin } from "antd";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Box } from "@mui/material";
import Title from "../components/Title";
import { useState, useEffect } from "react";
import { useTables } from "../Api";
import Error from "../components/Error";
import AddTableForm from "../forms/AddTableForm";
import UpdateTableForm from "../forms/UpdateTableForm";
import { useDispatch } from "react-redux";

function Tables() {
  const dispatch = useDispatch();
  const [reloadData, setReloadData] = useState(false);
  const { tablesData, tablesLoading, tablesApiError } = useTables(reloadData);
  const { confirm } = Modal;
  const [api, contextHolder] = notification.useNotification();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [chosenName, setChosenName] = useState("");
  const [filteredTablesData, setFilteredTablesData] = useState(null);
  const [inputSearch, setInputSearch] = useState(null);
  const [isSearch, setIsSearch] = useState(false);

  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    {
      field: "actions",
      type: "actions",
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => showUpdateModal(params.row.name)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => showDeleteConfirm(params.row.name)}
        />,
      ],
    },
  ];

  useEffect(() => {
    if (inputSearch !== null && inputSearch.trim() !== "") {
      const inputRegex = new RegExp(inputSearch, "i");
      setFilteredTablesData(
        tablesData.filter(
          (item) =>
            inputRegex.test(item.name) || inputRegex.test(item.description)
        )
      );
      setIsSearch(true);
    } else {
      setIsSearch(false);
    }
  }, [inputSearch, tablesData]);

  useEffect(() => {
    dispatch({ type: "FETCH_TABLES", tablesData });
  }, [dispatch, tablesData])

  function showNotification(type, message, description) {
    api[type]({
      message: message,
      description: description,
    });
  }

  function showDeleteConfirm(name) {
    confirm({
      title: "Delete Table",
      content: "Are you sure want to delete this table?",
      centered: true,
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_SERVER_URL}/api/v1/table/${name}`,
            {
              method: "DELETE",
            }
          );

          if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
          }

          showNotification(
            "success",
            "Success",
            "The table is successfully deleted."
          );
          setReloadData((prevState) => !prevState);
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

  function showUpdateModal(name) {
    setChosenName(name);
    setIsUpdateModalOpen(true);
  }

  function showAddModal() {
    setIsAddModalOpen(true);
  }

  return (
    <div className="tables-container">
      {contextHolder}
      <Header isOnlyTitle={true} />
      <div className="tables-main-container">
        <MenuSidebar page="Tables" />
        <div className="tables-main-content">
          {tablesLoading ? (
            <div className="loader-container">
              <Spin size="large" />
            </div>
          ) : tablesApiError !== null ? (
            <Error message="The server encountered an error and could not complete your request, please contact your administrator." />
          ) : (
            <>
              <AddTableForm
                isModalOpen={isAddModalOpen}
                setIsModalOpen={setIsAddModalOpen}
                data={tablesData}
                showNotification={showNotification}
                setReloadData={setReloadData}
              />
              <UpdateTableForm
                isModalOpen={isUpdateModalOpen}
                setIsModalOpen={setIsUpdateModalOpen}
                data={tablesData}
                chosenName={chosenName}
                showNotification={showNotification}
                setReloadData={setReloadData}
              />
              <div className="header-tables-container">
                <Title name="Tables" />
                <Button type="primary" onClick={showAddModal}>
                  Add Table
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
                  rows={!isSearch ? tablesData : filteredTablesData}
                  columns={columns}
                  autoPageSize={true}
                  getRowId={(row) => row.name}
                />
              </Box>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Tables;
