import {
  collection,
  getDoc,
  getDocs,
  doc,
  where,
  query,
  updateDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../config/firebase"; // Firebase config

//-------------------------------------------//
// INVOICE MANAGEMENT
//-------------------------------------------//

export const getAllInvoices = async () => {
  try {
    const snapshot = await getDocs(collection(db, "invoices"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }
};

export const getInvoiceByInvoiceId = async (invoiceId) => {
  try {
    const q = query(
      collection(db, "invoices"),
      where("invoice_id", "==", invoiceId)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } else {
      throw new Error("Invoice not found");
    }
  } catch (error) {
    console.error("Error fetching invoice by invoice_id:", error);
    throw error;
  }
};

export const updateInvoice = async (invoiceId, updatedData) => {
  try {
    // Query for the invoice document by invoice_id
    const q = query(
      collection(db, "invoices"),
      where("invoice_id", "==", invoiceId)
    );

    const snapshot = await getDocs(q);

    // Check if the invoice document exists
    if (!snapshot.empty) {
      const docRef = doc(db, "invoices", snapshot.docs[0].id);

      // Update the invoice with the new data
      await updateDoc(docRef, updatedData);

      console.log("Invoice updated successfully");
      return { success: true };
    } else {
      // Invoice not found
      console.error("Invoice not found");
      throw new Error("Invoice not found");
    }
  } catch (error) {
    console.error("Error updating invoice:", error.message);
    return { success: false, error: error.message };
  }
};

export const addInvoice = async (invoiceData) => {
  try {
    const docRef = await addDoc(collection(db, "invoices"), invoiceData);
    return {
      success: true,
      message: "Invoice added successfully!",
      id: docRef.id,
    };
  } catch (error) {
    console.error("Error adding invoice:", error);
    return { success: false, message: "Failed to add invoice" };
  }
};

export const deleteInvoice = async (invoiceId) => {
  try {
    const q = query(
      collection(db, "invoices"),
      where("invoice_id", "==", invoiceId)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docRef = doc(db, "invoices", snapshot.docs[0].id);
      await deleteDoc(docRef);
      return { success: true, message: "Invoice deleted successfully" };
    } else {
      throw new Error("Invoice not found");
    }
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return { success: false, message: "Failed to delete invoice" };
  }
};

//-------------------------------------------//
// PRODUCT MANAGEMENT
//-------------------------------------------//

const productCollection = collection(db, "products");

export const getAllProducts = async () => {
  try {
    const snapshot = await getDocs(productCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

export const addProduct = async (productData) => {
  try {
    const docRef = await addDoc(productCollection, productData);
    return {
      success: true,
      message: "Product added successfully!",
      id: docRef.id,
    };
  } catch (error) {
    console.error("Error adding product:", error);
    return { success: false, message: "Failed to add product" };
  }
};

export const updateProduct = async (productId, updatedData) => {
  try {
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, updatedData);
    return { success: true, message: "Product updated successfully!" };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, message: "Failed to update product" };
  }
};

export const deleteProduct = async (productId) => {
  try {
    const productRef = doc(db, "products", productId);
    await deleteDoc(productRef);
    return { success: true, message: "Product deleted successfully!" };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, message: "Failed to delete product" };
  }
};


export const deleteInvoiceById = async (invoiceId) => {
  try {
    const q = query(
      collection(db, "invoices"),
      where("invoice_id", "==", invoiceId)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docRef = doc(db, "invoices", snapshot.docs[0].id);
      await deleteDoc(docRef);
      return { success: true, message: "Invoice deleted successfully" };
    } else {
      throw new Error("Invoice not found");
    }
  } catch (error) {
    console.error("Error deleting invoice by invoiceId:", error);
    return { success: false, message: "Failed to delete invoice" };
  }
};
