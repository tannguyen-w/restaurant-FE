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

export { createInvoice, getCheckOrderInvoice, getAllInvoices };
