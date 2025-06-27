import axios from "./axiosCustomize";

const createInvoice = async (invoiceData) => {
  try {
    const response = await axios.post("/invoice", invoiceData);
    return response;
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
};

const getCheckOrderInvoice = async (orderId) => {
  try {
    const response = await axios.get(`/invoice/check/${orderId}`);
    return response;
  } catch (error) {
    console.error("Error checking order invoice:", error);
    throw error;
  }
};

const getAllInvoices = async (params) => {
  try {
    const response = await axios.get("/invoice", { params });
    return response;
  } catch (error) {
    console.error("Error fetching all invoices:", error);
    throw error;
  }
};

const updateInvoice = async (invoiceId, invoiceData) => {
  try {
    const response = await axios.put(`/invoice/${invoiceId}`, invoiceData);
    return response;
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw error;
  }
};

const deleteInvoice = async (invoiceId) => {
  try {
    const response = await axios.delete(`/invoice/${invoiceId}`);
    return response;
  } catch (error) {
    console.error("Error deleting invoice:", error);
    throw error;
  }
};

export { createInvoice, getCheckOrderInvoice, getAllInvoices, updateInvoice, deleteInvoice };
