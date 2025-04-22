import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getInvoiceByInvoiceId, updateInvoice } from "../services/billService";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { triggerToast } from "../utils/toast";
import Loader from "./Loader";
import PrintableBill from "./PrintableBill";
import "../styles/BillDetails.css";
import { data } from "../utils/dummyData";

const BillDetails = () => {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [additionalPayment, setAdditionalPayment] = useState(0);
  const [updatedDueAmount, setUpdatedDueAmount] = useState(0); // Track the live updated due amount
  const [originalPaid, setOriginalPaid] = useState(0);
  const printRef = useRef(null); // ✅ Reference for PDF generation

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      const data = await getInvoiceByInvoiceId(invoiceId);
      setInvoice(data);
      setOriginalPaid(data.paid_amount || 0);
      setUpdatedDueAmount(data.due_amount || 0); // Set the initial due amount
      setLoading(false);
    };

    fetchInvoice();
  }, [invoiceId]);

  const handleDownloadPDF = async () => {
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

  const handleUpdateAndPrint = async () => {
    try {
      // Determine the updated invoice values based on conditions
      let updatedInvoice = {};

      // Handling paid invoices
      if (updatedDueAmount === 0) {
        // Mark as "Paid"
        updatedInvoice = {
          paid_amount: originalPaid + additionalPayment,
          due_amount: 0, // No due amount if fully paid
          status: "Paid", // Set the invoice status to "Paid"
          // Add any other necessary fields
        };
      } else {
        // Handling unpaid or partially paid invoices
        updatedInvoice = {
          paid_amount: originalPaid + additionalPayment,
          due_amount: updatedDueAmount - additionalPayment,
          status:
            updatedDueAmount - additionalPayment === 0 ? "Paid" : "Unpaid", // Update status
          // Add any other necessary fields (like updated date, etc.)
        };
      }

      // Call updateInvoice function with the prepared updated data
      const response = await updateInvoice(invoiceId, updatedInvoice);

      if (response.success) {
        // Handle success, e.g., show a success message and trigger PDF download
        triggerToast("Invoice updated successfully!", "success");

        // Proceed with downloading the PDF or any other action you want
        handleDownloadPDF(); // This function is assumed to trigger PDF download
      } else {
        // Handle failure to update
        triggerToast(`Failed to update invoice: ${response.error}`, "error");
      }
    } catch (error) {
      // Catch any unexpected errors
      console.error("Error during invoice update:", error);
      triggerToast("An error occurred while updating the invoice.", "error");
    }
  };

  const handleEmailPDF = async () => {
    if (!window.electronAPI?.sendEmail) {
      triggerToast("Email function not available!", "error");
      return;
    }
    setLoading(true);


const emailBody = `
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 800px; margin: 0 auto; background-color: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 0 8px rgba(0,0,0,0.1);">

      <!-- Shop Header -->
      <div style="border-bottom: 2px solid #eee; padding-bottom: 16px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between;">
          <!-- Shop Info -->
          <div style="width: 60%;">
            <h2 style="margin: 0; color: #333;">${data.name}</h2>
            <p style="margin: 4px 0; color: #666;"><em>${data.slogan}</em></p>
            <p style="margin: 2px 0;">📞 ${data.phone}</p>
            <p style="margin: 2px 0;">📧 ${data.email}</p>
            <p style="margin: 2px 0;">GST No: ${data.gst}</p>
          </div>

          <!-- Bank Details -->
          <div style="width: 38%; border-left: 2px solid #f0f0f0; padding-left: 16px;">
            <h4 style="margin: 0 0 10px; color: #333; text-align: right;">Bank Details</h4>
            <table style="width: 100%; font-size: 14px; color: #444;">
              <tr>
                <td style="padding: 2px 4px;">Account</td>
                <td style="padding: 2px 4px; text-align: right;">${
                  data.bank.account
                }</td>
              </tr>
              <tr>
                <td style="padding: 2px 4px;">IFSC</td>
                <td style="padding: 2px 4px; text-align: right;">${
                  data.bank.ifsc
                }</td>
              </tr>
              <tr>
                <td style="padding: 2px 4px;">Branch</td>
                <td style="padding: 2px 4px; text-align: right;">${
                  data.bank.branch
                }</td>
              </tr>
            </table>
          </div>
        </div>
      </div>

      <!-- Customer & Invoice Info -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <div style="width: 48%;">
          <h4 style="margin-bottom: 8px; color: #333;">Customer Details</h4>
          <p><strong>Name:</strong> ${invoice.customer_name}</p>
          <p><strong>Phone:</strong> ${invoice.customer_phone}</p>
          <p><strong>Email:</strong> ${invoice.customer_email}</p>
          <p><strong>Address:</strong> ${invoice.customer_address}</p>
        </div>
        <div style="width: 48%; text-align: right;">
          <h4 style="margin-bottom: 8px; color: #333;">Invoice Info</h4>
          <p><strong>Invoice ID:</strong> ${invoice.invoice_id}</p>
          <p><strong>Date:</strong> ${new Date(
            invoice.date.seconds * 1000
          ).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${invoice.status}</p>
        </div>
      </div>

      <!-- Items Table -->
      <div style="margin-top: 10px;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 10px; background-color: #f4f4f4;">Item</th>
              <th style="border: 1px solid #ddd; padding: 10px; background-color: #f4f4f4;">Price (₹)</th>
              <th style="border: 1px solid #ddd; padding: 10px; background-color: #f4f4f4;">Qty</th>
              <th style="border: 1px solid #ddd; padding: 10px; background-color: #f4f4f4;">GST (%)</th>
              <th style="border: 1px solid #ddd; padding: 10px; background-color: #f4f4f4;">Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items
              .map(
                (item) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 10px;">${
                  item.name
                }</td>
                <td style="border: 1px solid #ddd; padding: 10px;">₹${
                  item.price
                }</td>
                <td style="border: 1px solid #ddd; padding: 10px;">${
                  item.unit
                }</td>
                <td style="border: 1px solid #ddd; padding: 10px;">${
                  item.cgst_rate + item.sgst_rate + item.igst_rate
                }%</td>
                <td style="border: 1px solid #ddd; padding: 10px;">₹${(
                  item.price * item.unit
                ).toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>

      <!-- Summary -->
      <div style="text-align: right; padding-top: 10px; border-top: 2px solid #eee;">
        <p style="margin: 4px 0;"><strong>CGST:</strong> ₹${invoice.cgst_amount?.toFixed(
          2
        )}</p>
        <p style="margin: 4px 0;"><strong>SGST:</strong> ₹${invoice.sgst_amount?.toFixed(
          2
        )}</p>
        <p style="margin: 4px 0;"><strong>IGST:</strong> ₹${invoice.igst_amount?.toFixed(
          2
        )}</p>
        <p style="margin: 8px 0;"><strong>GST Total:</strong> ₹${invoice.gst_amount?.toFixed(
          2
        )}</p>
        <p style="margin: 8px 0;"><strong>Total Amount:</strong> ₹${invoice.total_amount?.toFixed(
          2
        )}</p>
        <p style="margin: 4px 0;"><strong>Paid Amount:</strong> ₹${invoice.paid_amount?.toFixed(
          2
        )}</p>
        <p style="margin: 4px 0;"><strong>Due Amount:</strong> ₹${invoice.due_amount?.toFixed(
          2
        )}</p>
      </div>

    </div>
  </body>
</html>
`;




    const response = await window.electronAPI.sendEmail({
      to: "pratikvaghasiya11318@gmail.com",
      subject: "📜 Your Invoice from Shopper Bill Book",
      body: emailBody,
    });

    if (response.success) {
      setLoading(false);
      triggerToast("Invoice emailed successfully!", "success");
    } else {
      console.error("Email Error:", response.error);
      triggerToast("Failed to send email", "error");
    }
  };

  // Live calculation for additional payment
  const handleAdditionalPaymentChange = (e) => {
    const additionalPayment = parseFloat(e.target.value) || 0;
    setAdditionalPayment(additionalPayment);

    // Update the live due amount
    setUpdatedDueAmount(invoice.due_amount - additionalPayment);
  };

  if (loading) return <Loader />;
  if (!invoice) return <div className="error-message">Invoice not found.</div>;

  return (
    <div className="bill-container">
      {/* Business Header */}
      <header className="shop-header">
        <div className="shop-info">
          <h2>{data.name}</h2>
          <p className="slogan">{data.slogan}</p>
          <p>📞 {data.phone}</p>
          <p>📧 {data.email}</p>
          <p>GST: {data.gst}</p>
        </div>
        <div className="bank-info">
          <h4>Bank Details:</h4>
          <p>Account: {data.bank.account}</p>
          <p>IFSC: {data.bank.ifsc}</p>
          <p>Branch: {data.bank.branch}</p>
        </div>
        <div className="qr-code">
          <p>Scan Via UPI</p>
          <img
            src={data.qrCodeUrl}
            alt="UPI QR Code"
            style={{ width: "200px", height: "200px" }}
          />
        </div>
      </header>

      {/* Invoice Info */}
      <section className="invoice-info">
        <div className="customer-box">
          <p>
            <strong>Customer:</strong> {invoice.customer_name}
          </p>
          <p>
            <strong>Phone:</strong> {invoice.customer_phone}
          </p>
          {invoice.customer_email && (
            <p>
              <strong>Email:</strong> {invoice.customer_email}
            </p>
          )}
        </div>
        <div className="invoice-box">
          <p>
            <strong>Invoice ID:</strong> {invoice.invoice_id}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span
              className={`status ${
                invoice.status === "Paid" ? "paid" : "unpaid"
              }`}
            >
              {invoice.status}
            </span>
          </p>
        </div>
      </section>

      {/* ✅ Product Details Section */}
      <div className="items-container">
        {invoice.items.map((item, index) => (
          <div key={index} className="item-row">
            <span className="item-name">{item.name}</span>
            <span className="item-price">₹{item.price}</span>
            <span className="item-qty">{item.unit}</span>
            <span className="item-gst">
              {item.cgst_rate + item.igst_rate + item.sgst_rate}% GST
            </span>
            <span className="item-total">
              ₹{(item.price * item.unit).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Total Summary */}
      <div className="total-summary">
        <p>
          <strong>CGST:</strong> ₹{invoice.cgst_amount?.toFixed(2)}
        </p>
        <p>
          <strong>SGST:</strong> ₹{invoice.sgst_amount?.toFixed(2)}
        </p>
        <p>
          <strong>IGST:</strong> ₹{invoice.igst_amount?.toFixed(2)}
        </p>
        <p>
          <strong>GST Total:</strong> ₹{invoice.gst_amount?.toFixed(2)}
        </p>
        <p>
          <strong>Total Amount:</strong> ₹{invoice.total_amount?.toFixed(2)}
        </p>
        <p>
          <strong>Paid Amount:</strong> ₹{invoice.paid_amount?.toFixed(2)}
        </p>
        <p>
          <strong>Due Amount:</strong> ₹{updatedDueAmount?.toFixed(2)}
        </p>
      </div>

      {/* Additional Payment */}
      {invoice.due_amount > 0 && (
        <div className="additional-payment">
          <label>
            Additional Payment (₹):
            <input
              type="number"
              value={additionalPayment}
              onChange={handleAdditionalPaymentChange}
              placeholder="Enter additional payment"
              min="0"
            />
          </label>
        </div>
      )}

      {/* Actions */}
      <div className="actions">
        <button onClick={handleUpdateAndPrint}>Update and Print</button>
        <button onClick={handleDownloadPDF}>Download PDF</button>
        {invoice.customer_email && (
          <button onClick={handleEmailPDF}>Email Invoice</button>
        )}
      </div>

      <div ref={printRef} className="hidden-printable">
        <PrintableBill invoice={invoice} />
      </div>
    </div>
  );
};

export default BillDetails;
