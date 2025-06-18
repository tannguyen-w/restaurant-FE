import axios from "./axiosCustomize";

const getAllSuppliers = async (params) => {
  try {
    const response = await axios.get("/supplier", { params });
    // response.data.results: Danh sách nhà cung cấp
    return response; // Trả về danh sách nhà cung cấp
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    throw error;
  }
}
const getSupplierById = async (id) => {
  try {
    const response = await axios.get(`/supplier/${id}`);
    return response; // Trả về thông tin nhà cung cấp theo ID
  } catch (error) {
    console.error("Error fetching supplier by ID:", error);
    throw error;
  }
}
const createSupplier = async (supplierData) => {
  try {
    const response = await axios.post("/supplier", supplierData);
    return response; // Trả về thông tin nhà cung cấp đã thêm
  } catch (error) {
    console.error("Error adding supplier:", error);
    throw error;
  }
}
const updateSupplier = async (id, supplierData) => {
  try {
    const response = await axios.put(`/supplier/${id}`, supplierData);
    return response; // Trả về thông tin nhà cung cấp đã cập nhật
  } catch (error) {
    console.error("Error updating supplier:", error);
    throw error;
  }
}
const deleteSupplier = async (id) => {
  try {
    const response = await axios.delete(`/supplier/${id}`);
    return response; // Trả về thông tin nhà cung cấp đã xóa
  } catch (error) {
    console.error("Error deleting supplier:", error);
    throw error;
  }
}
export { getAllSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier };