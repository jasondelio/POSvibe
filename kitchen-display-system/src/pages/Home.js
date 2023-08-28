import "./Home.css";
import Header from "../components/Header";
import OrderCard from "../components/OrderCard";
import { useState, useEffect, useRef } from "react";
import { socket } from "../Socket";
import Pagination from "@mui/material/Pagination";

function Home() {
  const [height, setHeight] = useState(0);
  const [cardsPerRow, setCardsPerRow] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [orderType, setOrderType] = useState("activeOrders");
  const [maxWaitingTime, setMaxWaitingTime] = useState(30);
  const [orderList, setOrderList] = useState([]);
  const [historyOrderList, setHistoryOrderList] = useState([]);

  const mainContentRef = useRef(null);

  function handleInitialOrderData(data) {
    setOrderList(data);
  }

  function handleInitialHistoryOrderData(data) {
    setHistoryOrderList(data);
  }

  function handleNewOrderData(data) {
    if (data.orderNum) {
      setOrderList((prevData) => [...prevData, data]);
    }
  }

  function handleNewHistoryOrderData(data) {
    if (data.orderNum) {
      setHistoryOrderList((prevData) => [data, ...prevData]);
    }
  }

  function handleUpdatedOrderData(data) {
    setOrderList(data);
  }

  function handleChange(event, page) {
    setCurrentPage(page);
  }

  useEffect(() => {
    socket.on("getInitialOrderData", handleInitialOrderData);
    socket.on("getInitialHistoryOrderData", handleInitialHistoryOrderData);
    socket.on("getOrderData", handleNewOrderData);
    socket.on("getHistoryOrderData", handleNewHistoryOrderData);
    socket.on("getUpdatedOrderData", handleUpdatedOrderData);

    return () => {
      socket.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    if(localStorage.getItem("maxWaitingTime")){
      setMaxWaitingTime(localStorage.getItem("maxWaitingTime"));
    }
  }, [])

  function handleResize() {
    if (mainContentRef.current) {
      setHeight(mainContentRef.current.clientHeight - 20);
      const containerWidth = mainContentRef.current.clientWidth;
      const cardWidth = 350; // Replace 200 with the actual width of your OrderCard component
      const gapWidth = 20; // Replace 20 with the actual width of the gap
      const totalWidthWithGap = cardWidth + gapWidth;
      const cardsPerRow = Math.floor(containerWidth / totalWidthWithGap);
      setCardsPerRow(cardsPerRow);
    }
  }

  useEffect(() => {
    if (mainContentRef.current) {
      setHeight(mainContentRef.current.clientHeight - 20);
      const containerWidth = mainContentRef.current.clientWidth;
      const cardWidth = 350; // Replace 200 with the actual width of your OrderCard component
      const gapWidth = 20; // Replace 20 with the actual width of the gap
      const totalWidthWithGap = cardWidth + gapWidth;
      const cardsPerRow = Math.floor(containerWidth / totalWidthWithGap);
      setCardsPerRow(cardsPerRow);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="home-container">
      <Header
        orderType={orderType}
        setOrderType={setOrderType}
        maxWaitingTime={maxWaitingTime}
        setMaxWaitingTime={setMaxWaitingTime}
      />
      <div className="main-content" ref={mainContentRef}>
        <div className="order-list">
          {(orderType === "activeOrders" ? orderList : historyOrderList)
            .slice(
              cardsPerRow * currentPage - cardsPerRow,
              cardsPerRow * currentPage
            )
            .map((orderData) => {
              return (
                <OrderCard
                  key={orderData.orderNum}
                  height={height}
                  orderData={orderData}
                  socket={socket}
                  maxWaitingTime={maxWaitingTime}
                />
              );
            })}
        </div>
      </div>
      <div className="footer-container">
        <Pagination
          color="primary"
          count={Math.ceil(
            (orderType === "activeOrders" ? orderList : historyOrderList)
              .length / cardsPerRow
          )}
          shape="rounded"
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

export default Home;
