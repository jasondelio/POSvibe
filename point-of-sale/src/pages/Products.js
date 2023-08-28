import Header from "../components/Header";
import MenuSidebar from "../components/MenuSidebar";
import "./Products.css";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { Button, Input, Modal, notification, Spin, Image } from "antd";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Box } from "@mui/material";
import Title from "../components/Title";
import { useState, useEffect } from "react";
import { useProducts } from "../Api";
import Error from "../components/Error";
import AddProductForm from "../forms/AddProductForm";
import UpdateProductForm from "../forms/UpdateProductForm";
import { DEFAULT_IMAGE } from "../Constant";
import { useDispatch } from "react-redux";
import { CurrencyFormatterIDR } from "../utility/CurrencyFormatter";

function Products() {
  const dispatch = useDispatch();
  const [reloadData, setReloadData] = useState(false);
  const { productsData, productsLoading, productsApiError } =
    useProducts(reloadData);
  const { confirm } = Modal;
  const [api, contextHolder] = notification.useNotification();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [chosenName, setChosenName] = useState("");
  const [filteredProductsData, setFilteredProductsData] = useState(null);
  const [inputSearch, setInputSearch] = useState(null);
  const [isSearch, setIsSearch] = useState(false);

  const columns = [
    {
      field: "imgData",
      headerName: "Image",
      flex: 0.5,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <Image
            width={75}
            height={63}
            src={
              params.row.imgData.imgUrl
                ? params.row.imgData.imgUrl
                : DEFAULT_IMAGE
            }
          />
        );
      },
    },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "category", headerName: "Category", flex: 1 },
    {
      field: "price",
      headerName: "Price",
      flex: 0.5,
      valueFormatter: (params) => {
        return CurrencyFormatterIDR(params.value);
      },
    },
    {
      field: "isOutOfStock",
      headerName: "Out Of Stock?",
      flex: 0.5,
      valueFormatter: (params) => {
        return params.value ? "Yes" : "No";
      },
    },
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
      setFilteredProductsData(
        productsData.filter((item) => inputRegex.test(item.name))
      );
      setIsSearch(true);
    } else {
      setIsSearch(false);
    }
  }, [inputSearch, productsData]);

  useEffect(() => {
    dispatch({ type: "FETCH_PRODUCTS", productsData });
  }, [dispatch, productsData]);

  function showNotification(type, message, description) {
    api[type]({
      message: message,
      description: description,
    });
  }

  function showDeleteConfirm(name) {
    confirm({
      title: "Delete Product",
      content: "Are you sure want to delete this product?",
      centered: true,
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_SERVER_URL}/api/v1/product/${name}`,
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
            "The product is successfully deleted."
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
    <div className="products-container">
      {contextHolder}
      <Header isOnlyTitle={true} />
      <div className="products-main-container">
        <MenuSidebar page="Products" />
        <div className="products-main-content">
          {productsLoading ? (
            <div className="loader-container">
              <Spin size="large" />
            </div>
          ) : productsApiError !== null ? (
            <Error message="The server encountered an error and could not complete your request, please contact your administrator." />
          ) : (
            <>
              <AddProductForm
                isModalOpen={isAddModalOpen}
                setIsModalOpen={setIsAddModalOpen}
                data={productsData}
                showNotification={showNotification}
                setReloadData={setReloadData}
              />
              <UpdateProductForm
                isModalOpen={isUpdateModalOpen}
                setIsModalOpen={setIsUpdateModalOpen}
                data={productsData}
                chosenName={chosenName}
                showNotification={showNotification}
                setReloadData={setReloadData}
              />
              <div className="header-products-container">
                <Title name="Products" />
                <Button type="primary" onClick={showAddModal}>
                  Add Product
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
                  rows={!isSearch ? productsData : filteredProductsData}
                  columns={columns}
                  autoPageSize={true}
                  rowHeight={80}
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

export default Products;
