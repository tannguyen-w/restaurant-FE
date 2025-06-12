import axios from "./axiosCustomize";
const getAllSuppliers = async () => {
  try {
    const response = await axios.get("/supplier");
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
const addSupplier = async (supplierData) => {
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
export { getAllSuppliers, getSupplierById, addSupplier, updateSupplier, deleteSupplier };