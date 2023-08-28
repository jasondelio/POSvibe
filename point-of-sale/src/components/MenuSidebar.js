import './MenuSidebar.css';
import HomeIcon from "@mui/icons-material/Home";
import ListAltIcon from "@mui/icons-material/ListAlt";
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import { Link } from 'react-router-dom';


function MenuSidebar(props) {
  const page = props.page;
  return (
    <div className="menu-sidebar-container">
      <Link to="/home"
        className={
          page === "Home" ? "chosen-menu-item-container" : "menu-item-container"
        }
      >
        <HomeIcon />
        <p className="menu-text">Home</p>
      </Link>
      <Link to="/orders"
        className={
          page === "Orders" ? "chosen-menu-item-container" : "menu-item-container"
        }
      >
        <ListAltIcon />
        <p className="menu-text">Orders</p>
      </Link>
      <Link to="/products"
        className={
          page === "Products" ? "chosen-menu-item-container" : "menu-item-container"
        }
      >
        <InventoryIcon />
        <p className="menu-text">Products</p>
      </Link>
      <Link to="/categories"
        className={
          page === "Categories" ? "chosen-menu-item-container" : "menu-item-container"
        }
      >
        <CategoryIcon />
        <p className="menu-text">Categories</p>
      </Link>
      <Link to="/tables"
        className={
          page === "Tables" ? "chosen-menu-item-container" : "menu-item-container"
        }
      >
        <TableRestaurantIcon />
        <p className="menu-text">Tables</p>
      </Link>
    </div>
  );
}

export default MenuSidebar;
