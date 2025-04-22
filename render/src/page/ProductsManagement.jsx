import React, { useEffect, useState } from "react";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
} from "../services/billService";
import {
  FaTrash,
  FaPlus,
  FaTag,
  FaRupeeSign,
  FaInfoCircle,
} from "react-icons/fa";
import Input from "../components/Input";
import Loader from "../components/Loader"; // ✅ Add this
import { triggerToast } from "../utils/toast"; // ✅ Add this
import "../styles/ProductsManagement.css";

const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
  });
  const [loading, setLoading] = useState(false); // ✅ Loading state

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const allProducts = await getAllProducts();
      setProducts(allProducts);
    } catch (error) {
      triggerToast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      isNaN(formData.price) ||
      formData.price <= 0 ||
      !formData.description.trim()
    ) {
      triggerToast("Please enter valid product details!", "error");
      return;
    }

    setLoading(true);
    try {
      await addProduct({ ...formData, price: parseFloat(formData.price) });
      setFormData({ name: "", price: "", description: "" });
      triggerToast("Product added successfully", "success");
      fetchProducts();
    } catch (error) {
      triggerToast("Failed to add product", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

    setLoading(true);
    try {
      await deleteProduct(id);
      triggerToast("Product deleted", "success");
      fetchProducts();
    } catch (error) {
      triggerToast("Failed to delete product", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="products-container">
      <h2 className="title">🛒 Product Management</h2>

      <form onSubmit={handleAddProduct} className="form">
        <Input
          label="Product Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          icon={FaTag}
          required
        />
        <Input
          label="Price (₹)"
          type="number"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          icon={FaRupeeSign}
          required
        />
        <Input
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          icon={FaInfoCircle}
          required
        />
        <button type="submit" className="btn-add">
          <FaPlus /> Add Product
        </button>
      </form>

      <div>
        <h3 className="subtitle">📦 Product List</h3>
        {loading ? (
          <Loader /> // ✅ Custom loader while loading
        ) : products.length === 0 ? (
          <p className="no-products">No products available.</p>
        ) : (
          <table className="styled-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.id}>
                  <td>{prod.name}</td>
                  <td>₹{prod.price}</td>
                  <td>{prod.description}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(prod.id)}
                      className="btn-delete"
                    >
                      <FaTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductsManagement;
