import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import Dashboard from "./page/Dashboard";
import BillingList from "./page/BillingList";
import AddBill from "./page/AddBill";

import BillDetails from "./components/BillDetails";
import ProductsManagement from "./page/ProductsManagement";

function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen w-screen overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-auto p-5 bg-gray-50">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/bill-details/:invoiceId" element={<BillDetails />} />
            <Route path="/add-bill" element={<AddBill />} />
            <Route path="/billing-list" element={<BillingList />} />

            <Route path="/products" element={<ProductsManagement />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
