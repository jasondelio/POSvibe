import "./Home.css";
import Header from "../components/Header";
import MenuSidebar from "../components/MenuSidebar";
import OrderSidebar from "../components/OrderSidebar";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button, notification } from "antd";
import { DEFAULT_IMAGE } from "../Constant";
import { CurrencyFormatterIDR } from "../utility/CurrencyFormatter";

function Home({ layout }) {
  const categoriesData = useSelector((state) => state.categories);
  const productsData = useSelector((state) => state.products);
  const chosenOrdersData = useSelector((state) => state.chosenOrders);

  const [orderList, setOrderList] = useState([]);
  const [table, setTable] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [chosenCategory, setChosenCategory] = useState("All Items");
  const [filteredProductsData, setFilteredProductsData] = useState(null);
  const [inputSearch, setInputSearch] = useState(null);
  const [isSearch, setIsSearch] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  function addItem(newItem) {
    const index = orderList.findIndex((item) => item.name === newItem.name);
    if (index > -1) {
      const updatedOrder = [...orderList];
      updatedOrder[index].qty += 1;
      setOrderList(updatedOrder);
    } else {
      const updatedOrder = [
        ...orderList,
        { name: newItem.name, price: newItem.price, qty: 1, notes: "" },
      ];
      setOrderList(updatedOrder);
    }
  }

  function showNotification(type, message, description) {
    api[type]({
      message: message,
      description: description,
    });
  }

  useEffect(() => {
    let filteredData = productsData;

    if (chosenCategory !== "All Items") {
      filteredData = productsData.filter(
        (item) => item.category === chosenCategory
      );
    }

    if (inputSearch !== null && inputSearch.trim() !== "") {
      const inputRegex = new RegExp(inputSearch, "i");
      filteredData = filteredData.filter((item) => inputRegex.test(item.name));
    }

    setFilteredProductsData(filteredData);
    setIsSearch(
      chosenCategory !== "All Items" ||
        (inputSearch !== null && inputSearch.trim() !== "")
    );
  }, [inputSearch, productsData, chosenCategory]);

  useEffect(() => {
    setOrderList([]);
    setTable("");
    setCustomerName("");
    setChosenCategory("All Items");
    setFilteredProductsData(null);
    setInputSearch(null);
    setIsSearch(false);

    if (layout === "change-order" && chosenOrdersData?.length > 0) {
      const chosenOrder = chosenOrdersData[0];
      const clonedOrderList = chosenOrder.orderList.map((item) => ({
        ...item,
      }));
      setOrderList(clonedOrderList);
      setTable(chosenOrder.tableName);
      setCustomerName(chosenOrder.customerName);
    } else if (layout === "payment" && chosenOrdersData?.length > 0) {
      if (chosenOrdersData?.length > 1) {
        const mergedOrderList = chosenOrdersData.reduce((acc, curr) => {
          curr.orderList.forEach((item) => {
            const existingItem = acc.find((mergedItem) => mergedItem.name === item.name);
            if (existingItem) {
              existingItem.qty += item.qty;
            } else {
              acc.push({ ...item });
            }
          });
          return acc;
        }, []);
        setOrderList(mergedOrderList)
      } else {
        const chosenOrder = chosenOrdersData[0];
        const clonedOrderList = chosenOrder.orderList.map((item) => ({
          ...item,
        }));
        console.log(clonedOrderList)
        setOrderList(clonedOrderList);
      }
    }
  }, [layout, chosenOrdersData]);

  return (
    <div className="home-container">
      {contextHolder}
      <Header
        table={table}
        setTable={setTable}
        customerName={customerName}
        setCustomerName={setCustomerName}
        setInputSearch={setInputSearch}
        isOnlyTitle={layout === "payment"}
      />
      <div className="home-main-container">
        <MenuSidebar
          page={layout !== "change-order" && layout !== "payment" ? "Home" : ""}
        />
        <div
          className={
            layout === "payment"
              ? "product-container-disabled"
              : "product-container"
          }
        >
          <div className="category-container">
            <Button
              type={chosenCategory === "All Items" ? "primary" : "text"}
              key="All Items"
              onClick={() => setChosenCategory("All Items")}
            >
              All Items
            </Button>
            {categoriesData.map((category) => (
              <Button
                type={chosenCategory === category.name ? "primary" : "text"}
                key={category.name}
                onClick={(e) => setChosenCategory(category.name)}
              >
                {category.name}
              </Button>
            ))}
          </div>
          <div className="product-list">
            {(isSearch ? filteredProductsData : productsData).map((product) => (
              <div
                className={
                  "product-card " +
                  (product.isOutOfStock ? "product-card-disabled" : "")
                }
                key={product.name}
                onClick={() => addItem(product)}
              >
                <div className="img-container">
                  {product.isOutOfStock && (
                    <div className="out-of-stock-text">Out of Stock</div>
                  )}
                  <img
                    src={
                      product.imgData.imgUrl
                        ? product.imgData.imgUrl
                        : DEFAULT_IMAGE
                    }
                    alt="product"
                  />
                </div>
                <div className="product-info">
                  <p className="product-name">{product.name}</p>
                  <p className="product-price">
                    {CurrencyFormatterIDR(product.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <OrderSidebar
          orderList={orderList}
          setOrderList={setOrderList}
          showNotification={showNotification}
          table={table}
          setTable={setTable}
          customerName={customerName}
          setCustomerName={setCustomerName}
          layout={layout}
          chosenOrdersData={chosenOrdersData}
        />
      </div>
    </div>
  );
}

export default Home;
