import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CSVLink } from "react-csv";
import { getAllInvoices, deleteInvoiceById } from "../services/billService";
import InvoiceRow from "../components/InvoiceRow";
import {
  FaSearch,
  FaFileExport,
  FaPlusCircle,
  FaCalendarAlt,
  FaTrash,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isAfter } from "date-fns";
import "../styles/BillingList.css";
import { triggerToast } from "../utils/toast";
import Loader from "../components/Loader";

const formatCustomDate = (timestamp) => {
  try {
    const date =
      timestamp?.seconds != null
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-GB", options);
  } catch (error) {
    return "Invalid Date";
  }
};

const BillingList = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [fromDate, setFromDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toDate, setToDate] = useState(null);
  const today = new Date();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await getAllInvoices();
        setLoading(false)
        setInvoices(data);
        setFilteredData(data);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
    };

    fetchInvoices();
  }, []);

  const handleDelete = (invoiceId) => {
    const updatedInvoices = invoices.filter(
      (invoice) => invoice.invoice_id !== invoiceId
    );
    setInvoices(updatedInvoices);
    setFilteredData(updatedInvoices);
  };

  const handleFilterChange = () => {
    if (filterType === "range") {
      if (!fromDate || !toDate) {
        triggerToast("Please select both start and end dates.", "error");
        return;
      }
      if (isAfter(fromDate, today) || isAfter(toDate, today)) {
        triggerToast("Date cannot be in the future.", "error");
        return;
      }

      const from = new Date(fromDate);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);

      const filtered = invoices.filter((invoice) => {
        const invoiceDate = new Date(invoice.date.seconds * 1000);
        return invoiceDate >= from && invoiceDate <= to;
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(invoices);
    }
  };

  const handleDeleteAll = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete the selected invoices? This action cannot be undone."
    );
    if (!confirmDelete) return;

    const itemsToDelete = filterType === "all" ? invoices : filteredData;

    await Promise.all(
      itemsToDelete.map((invoice) => deleteInvoiceById(invoice.invoice_id))
    );

    const remaining = invoices.filter(
      (inv) => !itemsToDelete.some((i) => i.invoice_id === inv.invoice_id)
    );
    setInvoices(remaining);
    setFilteredData(remaining);
  };

  const headers = [
    { label: "Invoice ID", key: "invoice_id" },
    { label: "Customer Name", key: "customer_name" },
    { label: "Phone", key: "customer_phone" },
    { label: "Date", key: "date" },
    { label: "Paid Amount", key: "paid_amount" },
    { label: "Due Amount", key: "due_amount" },
    { label: "Total Amount", key: "total_amount" },
    { label: "Status", key: "status" },
  ];

  const formattedCSVData = filteredData.map((invoice) => ({
    invoice_id: invoice.invoice_id,
    customer_name: invoice.customer_name,
    customer_phone: invoice.customer_phone,
    date: formatCustomDate(invoice.date),
    paid_amount: invoice.paid_amount,
    due_amount: invoice.due_amount,
    total_amount: invoice.total_amount,
    status: invoice.status,
  }));

  return (
    <div className="billing-container">
      <h2 className="billing-title">📜 Billing List</h2>
      <p className="billing-description">View and manage all your invoices.</p>
      {loading ? (
        <div className="loader-container">
          <Loader />
        </div>
      ) : (
        <div>
          <div className="actions">
            <Link to="/add-bill" className="action-btn add-bill">
              <FaPlusCircle /> Add New Bill
            </Link>

            <div className="filter-container">
              <div>
                <FaSearch className="filter-icon" />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-dropdown"
              >
                <option value="all">All</option>
                <option value="range">Custom Range</option>
              </select>

              {filterType === "range" && (
                <>
                  <div className="date-filter">
                    <FaCalendarAlt className="calendar-icon" />
                    <DatePicker
                      selected={fromDate}
                      onChange={(date) => setFromDate(date)}
                      maxDate={today}
                      placeholderText="From Date"
                      className="filter-input"
                    />
                  </div>
                  <div className="date-filter">
                    <FaCalendarAlt className="calendar-icon" />
                    <DatePicker
                      selected={toDate}
                      onChange={(date) => setToDate(date)}
                      minDate={fromDate}
                      maxDate={today}
                      placeholderText="To Date"
                      className="filter-input"
                    />
                  </div>
                </>
              )}

              <button onClick={handleFilterChange} className="filter-btn">
                Apply
              </button>
            </div>

            <CSVLink
              data={formattedCSVData}
              headers={headers}
              filename="billing_list.csv"
              className="action-btn export-csv"
            >
              <FaFileExport /> Export CSV
            </CSVLink>

            <button onClick={handleDeleteAll} className="action-btn delete-all">
              <FaTrash /> Delete All Data
            </button>
          </div>

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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((invoice) => (
                <InvoiceRow
                  key={invoice.invoice_id}
                  invoice={invoice}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BillingList;
