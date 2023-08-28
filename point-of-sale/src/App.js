import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Tables from "./pages/Tables";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useProducts, useCategories, useTables } from "./Api";
import Error from "./components/Error";
import { Spin } from "antd";

function App() {
  const dispatch = useDispatch();
  const [productsReload, setProductsReload] = useState(false);

  const { productsData, productsLoading, productsApiError } =
    useProducts(productsReload);
  const { categoriesData, categoriesLoading, categoriesApiError } =
    useCategories();
  const { tablesData, tablesLoading, tablesApiError } = useTables();

  useEffect(() => {
    if (productsData.length > 0) {
      dispatch({ type: "FETCH_PRODUCTS", productsData });
    }
  }, [dispatch, productsData]);

  useEffect(() => {
    if (categoriesData.length > 0) {
      dispatch({ type: "FETCH_CATEGORIES", categoriesData });
    }
  }, [dispatch, categoriesData]);

  useEffect(() => {
    if (tablesData.length > 0) {
      dispatch({ type: "FETCH_TABLES", tablesData });
    }
  }, [dispatch, tablesData]);

  return (
    <div className="app-container">
      {categoriesLoading || productsLoading || tablesLoading ? (
        <div className="loader-container">
          <Spin size="large" />
        </div>
      ) : categoriesApiError !== null ||
        productsApiError !== null ||
        tablesApiError !== null ? (
        <Error message="The server encountered an error and could not complete your request, please contact your administrator." />
      ) : (
        <Router>
          <Routes>
            <Route exact path="/home" element={<Home />} />
            <Route exact path="/orders" element={<Orders />} />
            <Route exact path="/products" element={<Products />} />
            <Route
              exact
              path="/categories"
              element={<Categories setProductsReload={setProductsReload} />}
            />
            <Route exact path="/tables" element={<Tables />} />
            <Route exact path="/payment" element={<Home layout="payment" />} />
            <Route
              exact
              path="/change-order"
              element={<Home layout="change-order" />}
            />
            <Route exact path="/*" element={<Navigate to="/home" />} />
          </Routes>
        </Router>
      )}
    </div>
  );
}

export default App;
