import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { FaDownload, FaTrash } from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { formatDate } from "../utils/formatDate";
import { triggerToast } from "../utils/toast";
import PrintableBill from "./PrintableBill";

import "../styles/InvoiceRow.css";
import { deleteInvoice } from "../services/billService";

const InvoiceRow = ({ invoice, onDelete }) => {
  const printRef = useRef(null);

  const handleDownload = async () => {
    const element = printRef.current;

    if (!element) {
      console.error("Invoice element not found!");
      triggerToast("Invoice element not found!", "error");
      return;
    }

    try {
      element.style.visibility = "visible";
      element.style.position = "relative";

      setTimeout(async () => {
        const canvas = await html2canvas(element, { scale: 3 });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 10, 10, pdfWidth - 20, pdfHeight - 20);
        pdf.save(`${invoice.invoice_id}.pdf`);

        element.style.visibility = "hidden";
        element.style.position = "absolute";

        triggerToast("PDF downloaded successfully!", "success");
      }, 500);
    } catch (error) {
      console.error("Error generating PDF:", error);
      triggerToast("Error downloading PDF!", "error");
    }
  };

  const handleDeleteClick = async () => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        const result = await deleteInvoice(invoice.invoice_id); // Call deleteInvoice
        if (result.success) {
          triggerToast(result.message, "success");
          onDelete(invoice.invoice_id); // Update parent component
        } else {
          triggerToast(result.message, "error");
        }
      } catch (error) {
        console.error("Error deleting invoice:", error);
        // triggerToast("Error deleting invoice", "error");
      }
    }
  };

  return (
    <>
      <tr className="invoice-row">
        <td className="p-4 font-semibold text-gray-800">
          {invoice.customer_name}
        </td>
        <td className="p-4 text-gray-600">{invoice.customer_phone}</td>
        <td className="p-4">
          <Link
            to={`/bill-details/${invoice.invoice_id}`}
            className="invoice-link"
          >
            {invoice.invoice_id}
          </Link>
        </td>
        <td className="p-4 text-gray-600">{formatDate(invoice.date)}</td>
        <td className="p-4 font-bold text-gray-800">₹{invoice.paid_amount}</td>
        <td className="p-4 font-bold text-gray-800">₹{invoice.due_amount}</td>
        <td className="p-4 font-bold text-gray-900">₹{invoice.total_amount}</td>
        <td className="p-4">
          <div
            className={`status-box ${
              invoice.status === "Unpaid" ? "status-unpaid" : "status-paid"
            }`}
          >
            {invoice.status}
          </div>
        </td>
        <td className="p-4">
          <div className="action-buttons">
            <button onClick={handleDownload} className="download-btn">
              <FaDownload /> Download
            </button>
            <button onClick={handleDeleteClick} className="delete-btn">
              <FaTrash /> Delete
            </button>
          </div>
        </td>
      </tr>

      {/* ✅ Hidden printable invoice */}
      <div ref={printRef} className="hidden-printable">
        <PrintableBill invoice={invoice} />
      </div>
    </>
  );
};

export default InvoiceRow;
