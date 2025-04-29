import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import { FaHome, FaList, FaPlus, FaChartBar } from "react-icons/fa";
import logo from "../../public/src/assets/logo.png";

<img src={logo} alt="Logo" className="logo-img" />


const Navbar = () => {
  return (
    <nav className="navbar">
      {/* ✅ Logo with subtle animation */}
      <div className="logo flex-row justify-center">
<img src={logo} alt="Logo" className="logo-img" />

        <span>Neet Trailer</span>
      </div>

      <ul className="nav-links">
        <li>
          <Link to="/" className="nav-item">
            <FaHome className="nav-icon" />
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/billing-list" className="nav-item">
            <FaList className="nav-icon" />
            Billing List
          </Link>
        </li>
        <li>
          <Link to="/add-bill" className="nav-item">
            <FaPlus className="nav-icon" />
            Add Bill
          </Link>
        </li>
        <li>
          <Link to="/products" className="nav-item">
            <FaChartBar className="nav-icon" />
            Management
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
