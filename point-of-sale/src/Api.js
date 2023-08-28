import { useState, useEffect } from "react";

function useProducts(reload) {
  const [productsData, setProductsData] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsApiError, setProductsApiError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    (async () => {
      try {
        let res = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/v1/product`,
          { signal }
        );
        let data = await res.json();
        setProductsData(data.reverse());
        setProductsLoading(false);
      } catch (err) {
        if (err.name !== "AbortError") {
          setProductsApiError(err);
          setProductsLoading(false);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [reload]);

  return { productsData, productsLoading, productsApiError };
}

function useCategories(reload) {
  const [categoriesData, setCategoriesData] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesApiError, setCategoriesApiError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    (async () => {
      try {
        let res = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/v1/category`,
          { signal }
        );
        let data = await res.json();
        setCategoriesData(data.reverse());
        setCategoriesLoading(false);
      } catch (err) {
        if (err.name !== "AbortError") {
          setCategoriesApiError(err);
          setCategoriesLoading(false);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [reload]);

  return { categoriesData, categoriesLoading, categoriesApiError };
}

function useTables(reload) {
  const [tablesData, setTablesData] = useState([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [tablesApiError, setTablesApiError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    (async () => {
      try {
        let res = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/v1/table`,
          { signal }
        );
        let data = await res.json();
        setTablesData(data.reverse());
        setTablesLoading(false);
      } catch (err) {
        if (err.name !== "AbortError") {
          setTablesApiError(err);
          setTablesLoading(false);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [reload]);

  return { tablesData, tablesLoading, tablesApiError };
}

function useOrders(reload) {
  const [ordersData, setOrdersData] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersApiError, setOrdersApiError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    (async () => {
      try {
        let res = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/v1/order`,
          { signal }
        );
        let data = await res.json();
        
        setOrdersData(data.reverse());
        setOrdersLoading(false);
      } catch (err) {
        if (err.name !== "AbortError") {
          setOrdersApiError(err);
          setOrdersLoading(false);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [reload]);

  return { ordersData, ordersLoading, ordersApiError };
}

export { useProducts, useCategories, useTables, useOrders };
