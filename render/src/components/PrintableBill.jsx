import React from "react";
import "../styles/BillDetails.css";
import { data } from "../utils/dummyData";

const PrintableBill = ({ invoice }) => {
  if (!invoice) return null;

  return (
    <div
      id={`invoice-${invoice.invoice_id}`}
      className="bill-container bg-white text-black p-4 rounded"
      style={{ display: "block", width: "100%", maxWidth: "100%" }}
    >
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
          <p>
            <strong>Email:</strong> {invoice.customer_email}
          </p>
          <p>
            <strong>Address:</strong> {invoice.customer_address}
          </p>
        </div>

        <div className="invoice-box">
          <p>
            <strong>Invoice ID:</strong> {invoice.invoice_id}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(invoice.date.seconds * 1000).toLocaleDateString()}
          </p>
          <p>
            <strong>Status:</strong> {invoice.status}
          </p>
        </div>
      </section>

      {/* Items */}
      <div className="items-container">
        {invoice.items.map((item, index) => (
          <div key={index} className="item-row">
            <span className="item-name">{item.name}</span>
            <span className="item-price">₹{item.price}</span>
            <span className="item-qty">{item.unit}</span>
            <span className="item-gst">{item.gst_rate}% GST</span>
            <span className="item-total">
              ₹{(item.price * item.unit).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <section className="total-summary">
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
          <strong>Due Amount:</strong> ₹{invoice.due_amount?.toFixed(2)}
        </p>
      </section>

      {/* Signature / Stamp Section */}
      <section className="signature-stamp">
        <div className="signature-box">
          <p>Authorized Signature</p>
        </div>
        <div className="stamp-box">
          <p>Company Stamp</p>
        </div>
      </section>
    </div>
  );
};

export default PrintableBill;
