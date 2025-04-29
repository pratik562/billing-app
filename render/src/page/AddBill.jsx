import React, { useState, useEffect } from "react";
import {
  getAllInvoices,
  addInvoice,
  getAllProducts,
} from "../services/billService";
import { triggerToast } from "../utils/toast";
import { Timestamp } from "firebase/firestore";
import Input from "../components/Input";
import Button from "../components/Button";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaHome,
  FaFileInvoice,
  FaMoneyBillWave,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import "../styles/AddBill.css";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

const gstRates = [0, 2.5, 5, 9, 14, 18];

const AddBill = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    customer_address: "",
    invoice_id: "",
    status: "Unpaid",
    paid_amount: 0,
    total_amount: 0,
    due_amount: 0,
    gst_amount: 0,
    cgst_amount: 0,
    sgst_amount: 0,
    igst_amount: 0,
    items: [],
    date: Timestamp.fromDate(new Date()),
  });

  useEffect(() => {
    const fetchLatestInvoiceID = async () => {
      
      const invoices = await getAllInvoices();
      const currentYear = new Date().getFullYear();

      if (invoices.length > 0) {
        const latestInvoiceID = invoices[invoices.length - 1].invoice_id;
        const lastInvoiceYear = latestInvoiceID.split("-")[1];
        const lastInvoiceNumber = parseInt(latestInvoiceID.split("-")[2], 10);

        const nextInvoiceNumber =
          lastInvoiceYear === String(currentYear) ? lastInvoiceNumber + 1 : 1;

        const newInvoiceID = `INV-${currentYear}-${nextInvoiceNumber
          .toString()
          .padStart(3, "0")}`;
        setInvoice((prev) => ({
          ...prev,
          invoice_id: newInvoiceID,
        }));
      } else {
        const newInvoiceID = `INV-${currentYear}-001`;
        setInvoice((prev) => ({
          ...prev,
          invoice_id: newInvoiceID,
        }));
      }
    };

    const fetchProducts = async () => {
      try {
        const productData = await getAllProducts();
        setProducts(productData);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        triggerToast("Error fetching products", "error");
      }
    };

    fetchLatestInvoiceID();
    fetchProducts();
  }, []);

  useEffect(() => {
    let total = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    invoice.items.forEach((item) => {
      const itemTotal = item.price * item.unit;
      const itemCgst = (itemTotal * item.cgst_rate) / 100;
      const itemSgst = (itemTotal * item.sgst_rate) / 100;
      const itemIgst = (itemTotal * item.igst_rate) / 100;

      total += itemTotal + itemCgst + itemSgst + itemIgst;
      cgst += itemCgst;
      sgst += itemSgst;
      igst += itemIgst;
    });

    setInvoice((prev) => ({
      ...prev,
      cgst_amount: cgst,
      sgst_amount: sgst,
      igst_amount: igst,
      gst_amount: cgst + sgst + igst,
      total_amount: total,
      due_amount: total - prev.paid_amount,
    }));
  }, [invoice.items, invoice.paid_amount]);

  useEffect(() => {
    const isPaid = invoice.paid_amount >= invoice.total_amount;

    setInvoice((prev) => ({
      ...prev,
      status: isPaid ? "Paid" : "Unpaid",
    }));
  }, [invoice.paid_amount, invoice.total_amount]);

  const handleInputChange = (field, value) => {
    setInvoice((prev) => ({
      ...prev,
      [field]: field === "paid_amount" ? parseFloat(value) || 0 : value,
    }));
  };

  const addNewItem = () => {
    setInvoice((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          name: "",
          category: "",
          price: 0,
          description: "",
          unit: 1,
          cgst_rate: 0,
          sgst_rate: 0,
          igst_rate: 0,
        },
      ],
    }));
  };

  const removeItem = (index) => {
    setInvoice((prev) => {
      const updatedItems = [...prev.items];
      updatedItems.splice(index, 1);
      return { ...prev, items: updatedItems };
    });
  };

  const updateItem = (index, field, value) => {
    setInvoice((prev) => {
      const updatedItems = [...prev.items];
      updatedItems[index][field] =
        field === "unit" || field === "price" ? parseFloat(value) || 0 : value;
      return { ...prev, items: updatedItems };
    });
  };

  const handleProductSelection = (index, selectedProduct) => {
    setInvoice((prev) => {
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...selectedProduct,
        unit: 1,
        cgst_rate: 0,
        sgst_rate: 0,
        igst_rate: 0,
      };
      return { ...prev, items: updatedItems };
    });
  };

  const validateForm = () => {
    if (!invoice.customer_name || !invoice.customer_phone) {
      triggerToast("Customer Name and Mobile Number are mandatory", "error");
      return false;
    }
    if (
      invoice.items.length === 0 ||
      invoice.items.some((item) => !item.name || !item.price || item.unit <= 0)
    ) {
      triggerToast("Please add valid items to the invoice", "error");
      return false;
    }
    return true;
  };

  const handleAddInvoice = async () => {
    setLoading(true)
    if (!validateForm()) return;

    try {
      setLoading(true)
      await addInvoice(invoice);
      setLoading(false)
      triggerToast("Invoice added successfully!", "success");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("Error adding invoice:", err);
      triggerToast("Failed to add invoice", "error");
    }
  };

  return (
    <div className="dashboard-container">

          {loading ? (
            <div className="loader-container">
              <Loader /> 
            </div>
          ) :(
            <main className="main-content">
            <h2 className="dashboard-title">Add New Bill</h2>
    
            <div className="card">
              <h3>Customer Information</h3>
              <Input
                label="Customer Name"
                value={invoice.customer_name}
                onChange={(e) => handleInputChange("customer_name", e.target.value)}
                icon={FaUser}
              />
              <Input
                label="Phone"
                value={invoice.customer_phone}
                onChange={(e) =>
                  handleInputChange("customer_phone", e.target.value)
                }
                icon={FaPhone}
              />
              <Input
                label="Email"
                type="email"
                value={invoice.customer_email}
                onChange={(e) =>
                  handleInputChange("customer_email", e.target.value)
                }
                icon={FaEnvelope}
              />
              <Input
                label="Address"
                value={invoice.customer_address}
                onChange={(e) =>
                  handleInputChange("customer_address", e.target.value)
                }
                icon={FaHome}
              />
            </div>
    
            <div className="card items-card">
              <h3 className="card-title">🛒 Invoice Items</h3>
    
              {invoice.items.map((item, index) => (
                <div key={index} className="item-block">
                  {/* Product Dropdown */}
                  <div className="input-group">
                    <label>Select Product</label>
                    <select
                      className="styled-select"
                      value={item.name}
                      onChange={(e) =>
                        handleProductSelection(
                          index,
                          products.find((p) => p.name === e.target.value)
                        )
                      }
                    >
                      <option value="">Select Product</option>
                      {products.map((product) => (
                        <option key={product.name} value={product.name}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
    
                  {/* Units & Price */}
                  <div className="input-row">
                    <div className="input-group">
                      <label>Units</label>
                      <input
                        type="number"
                        className="styled-input"
                        value={item.unit}
                        onChange={(e) => updateItem(index, "unit", e.target.value)}
                      />
                    </div>
                    <div className="input-group">
                      <label>Price</label>
                      <input
                        type="number"
                        className="styled-input"
                        value={item.price}
                        onChange={(e) => updateItem(index, "price", e.target.value)}
                      />
                    </div>
                  </div>
    
                  {/* Description */}
                  <div className="input-group full">
                    <label>Description</label>
                    <input
                      className="styled-input"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(index, "description", e.target.value)
                      }
                    />
                  </div>
    
                  {/* GST Dropdowns */}
                  <div className="input-row">
                    <div className="input-group">
                      <label>CGST</label>
                      <select
                        className="gst-select cgst"
                        value={item.cgst_rate}
                        onChange={(e) =>
                          updateItem(index, "cgst_rate", parseFloat(e.target.value))
                        }
                      >
                        {gstRates.map((rate) => (
                          <option key={rate} value={rate}>
                            CGST {rate}%
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="input-group">
                      <label>SGST</label>
                      <select
                        className="gst-select sgst"
                        value={item.sgst_rate}
                        onChange={(e) =>
                          updateItem(index, "sgst_rate", parseFloat(e.target.value))
                        }
                      >
                        {gstRates.map((rate) => (
                          <option key={rate} value={rate}>
                            SGST {rate}%
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="input-group">
                      <label>IGST</label>
                      <select
                        className="gst-select igst"
                        value={item.igst_rate}
                        onChange={(e) =>
                          updateItem(index, "igst_rate", parseFloat(e.target.value))
                        }
                      >
                        {gstRates.map((rate) => (
                          <option key={rate} value={rate}>
                            IGST {rate}%
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
    
                  {/* Remove Button */}
                  <div className="btn-remove">
                    <Button
                      onClick={() => removeItem(index)}
                      icon={FaTrash}
                      variant="danger"
                    />
                  </div>
                </div>
              ))}
    
              <Button onClick={addNewItem} variant="secondary" icon={FaPlus}>
                Add Item
              </Button>
            </div>
    
            <div className="card">
              <h3>Invoice Total</h3>
              <Input
                label="Total Amount"
                type="number"
                value={invoice.total_amount.toFixed(2)}
                readOnly
              />
              <Input
                label="Paid Amount"
                type="number"
                value={invoice.paid_amount}
                onChange={(e) => handleInputChange("paid_amount", e.target.value)}
              />
              <Input
                label="Due Amount"
                type="number"
                value={invoice.due_amount.toFixed(2)}
                readOnly
              />
            </div>
    
            <Button onClick={handleAddInvoice} variant="primary">
              Add Invoice
            </Button>
          </main>
          )}
     
    </div>
  );
};

export default AddBill;
