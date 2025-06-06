import axios from "./axiosCustomize";

const createInvoice = async (invoiceData) => {
  try {
    const response = await axios.post("/invoice", invoiceData);
    return response.data;
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
}

export { createInvoice };