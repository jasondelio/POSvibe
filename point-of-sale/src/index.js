import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import productsReducer from "./reducers/products-reducer";
import categoriesReducer from "./reducers/categories-reducer";
import tablesReducer from "./reducers/tables-reducer";
import ordersReducer from "./reducers/orders-reducer";

const root = ReactDOM.createRoot(document.getElementById("root"));
const store = configureStore(
  { reducer: { products : productsReducer, categories: categoriesReducer, tables : tablesReducer, chosenOrders : ordersReducer } },
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

root.render(
  <Provider store={store}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
