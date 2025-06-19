import axios from "./axiosCustomize";

const createImportInvoice = async (data) => {
  try {
    const response = await axios.post("/import-invoice", data);
    return response;
  } catch (error) {
    console.error("Error creating import invoice:", error);
    throw error;
  }
}

const getImportInvoices = async (params) => {
  try {
    const response = await axios.get("/import-invoice", { params });
    return response;
  } catch (error) {
    console.error("Error fetching import invoices:", error);
    throw error;
  }
}

const updateImportInvoice = async (id, data) => {
  try {
    const response = await axios.put(`/import-invoice/${id}`, data);
    return response;
  } catch (error) {
    console.error("Error updating import invoice:", error);
    throw error;
  }
}

const deleteImportInvoice = async (id) => {
  try {
    const response = await axios.delete(`/import-invoice/${id}`);
    return response;
  } catch (error) {
    console.error("Error deleting import invoice:", error);
    throw error;
  }
}

const getImportInvoiceById = async (id) => {
  try {
    const response = await axios.get(`/import-invoice/${id}`);
    return response;
  } catch (error) {
    console.error("Error fetching import invoice by ID:", error);
    throw error;
  }
}

export { createImportInvoice, getImportInvoices, updateImportInvoice, deleteImportInvoice, getImportInvoiceById };