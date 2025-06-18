import axios from "./axiosCustomize";

const createImportInvoiceDetail = async (data) => {
  try {
    const response = await axios.post("/import-invoice-detail", data);
    return response;
  } catch (error) {
    console.error("Error creating import invoice detail:", error);
    throw error;
  }
}

const getImportInvoiceDetails = async (params) => {
  try {
    const response = await axios.get("/import-invoice-detail", { params });
    return response;
  } catch (error) {
    console.error("Error fetching import invoice details:", error);
    throw error;
  }
}

const getImportInvoiceDetailByInvoiceId = async (invoiceId) => {
  try {
    const response = await axios.get(`/import-invoice-detail/invoice/${invoiceId}`);
    return response;
  } catch (error) {
    console.error("Error fetching import invoice details by invoice ID:", error);
    throw error;
  }
}

const updateImportInvoiceDetail = async (id, data) => {
  try {
    const response = await axios.put(`/import-invoice-detail/${id}`, data);
    return response;
  } catch (error) {
    console.error("Error updating import invoice detail:", error);
    throw error;
  }
}

const deleteImportInvoiceDetail = async (id) => {
  try {
    const response = await axios.delete(`/import-invoice-detail/${id}`);
    return response;
  } catch (error) {
    console.error("Error deleting import invoice detail:", error);
    throw error;
  }
}   

export { createImportInvoiceDetail, getImportInvoiceDetails, updateImportInvoiceDetail, deleteImportInvoiceDetail, getImportInvoiceDetailByInvoiceId };