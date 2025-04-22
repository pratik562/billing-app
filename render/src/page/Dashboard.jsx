import React, { useEffect, useState } from "react";
import { getAllInvoices } from "../services/billService";
import Loader from "../components/Loader";
import InvoiceRow from "../components/InvoiceRow";
import SearchBar from "../components/SearchBar"; // ✅ Import SearchBar
import "../styles/Dashboard.css"

const Dashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [yearlyTotal, setYearlyTotal] = useState(0);

  const fetchData = async () => {
    setLoading(true); // ✅ Set loader ON when fetching data
    const data = await getAllInvoices();

    // ✅ Sort unpaid invoices first
    const sortedInvoices = [
      ...data.filter((inv) => inv.status === "Unpaid"),
      ...data.filter((inv) => inv.status === "Paid"),
    ];

    setInvoices(sortedInvoices);
    setFilteredInvoices(sortedInvoices);

    const now = new Date();
    let monthly = 0,
      yearly = 0;

    sortedInvoices.forEach((invoice) => {
      const date = new Date(invoice.date?.seconds * 1000);
      if (date.getFullYear() === now.getFullYear()) {
        yearly += invoice.total_amount || 0;
        if (date.getMonth() === now.getMonth()) {
          monthly += invoice.total_amount || 0;
        }
      }
    });

    setMonthlyTotal(monthly);
    setYearlyTotal(yearly);
    setLoading(false); // ✅ Set loader OFF after data fetch
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Search function for filtering invoices by name or phone
  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredInvoices(invoices);
      return;
    }
    const filtered = invoices.filter(
      (invoice) =>
        invoice.customer_name.toLowerCase().includes(query.toLowerCase()) ||
        invoice.customer_phone.includes(query)
    );
    setFilteredInvoices(filtered);
  };

  // ✅ Clear search filter & restore full data
  const handleClearSearch = () => {
    setFilteredInvoices(invoices);
  };

return (
  <div className="dashboard-container">
    {loading ? (
      <div className="loader-container">
        <Loader /> 
      </div>
    ) : (
      <div className="dashboard-content">
        {/* ✅ Monthly & Yearly Sales Summary */}
        <div className="summary-grid">
          <div className="summary-card monthly">
            <h3>Monthly Sales</h3>
            <p>₹{monthlyTotal}</p>
          </div>
          <div className="summary-card yearly">
            <h3>Yearly Sales</h3>
            <p>₹{yearlyTotal}</p>
          </div>
        </div>

        {/* ✅ Search Bar */}
        <SearchBar onSearch={handleSearch} onClear={handleClearSearch} />

        {/* ✅ Refresh Button */}
        <button onClick={fetchData} className="refresh-btn">
          Refresh Data
        </button>

        {/* ✅ Recent Bills Table */}
        <h2 className="section-title">Recent Bills</h2>
        <div className="table-wrapper">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Invoice ID</th>
                <th>Date</th>
                <th>Paid Amount</th>
                <th>Due Amount</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <InvoiceRow key={invoice.invoice_id} invoice={invoice} />
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-data">
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);
};

export default Dashboard;
