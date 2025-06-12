import axios from "./axiosCustomize";

const getAllTables = async () => {
  try {
    const response = await axios.get("/table");
    return response.results; // Trả về danh sách bàn
  } catch (error) {
    console.error("Error fetching tables:", error);
    throw error;
  }
};

const getAvailableTables = async () => {
  try {
    const response = await axios.get("/table/available");
    return response.results; // Trả về danh sách bàn
  } catch (error) {
    console.error("Error fetching available tables:", error);
    throw error;
  }
};

const getTablesByRestaurant = async (restaurantId) => {
  try {
    const response = await axios.get(`/table/restaurant/${restaurantId}`);
    return response.results; // Trả về danh sách bàn theo nhà hàng
  } catch (error) {
    console.error("Error fetching tables by restaurant:", error);
    throw error;
  }
};

const getTableById = async (id) => {
  try {
    const response = await axios.get(`/table/${id}`);
    return response; // Trả về thông tin bàn theo ID
  } catch (error) {
    console.error("Error fetching table by ID:", error);
    throw error;
  }
};

const createTable = async (tableData) => {
  try {
    const response = await axios.post("/table", tableData);
    return response; // Trả về thông tin bàn mới tạo
  } catch (error) {
    console.error("Error creating table:", error);
    throw error;
  }
};

const updateTable = async (id, tableData) => {
  try {
    const response = await axios.put(`/table/${id}`, tableData);
    return response; // Trả về thông tin bàn đã cập nhật
  } catch (error) {
    console.error("Error updating table:", error);
    throw error;
  }
};

const deleteTable = async (id) => {
  try {
    const response = await axios.delete(`/table/${id}`);
    return response; // Trả về thông tin bàn đã xóa
  } catch (error) {
    console.error("Error deleting table:", error);
    throw error;
  }
};

export { getAllTables, getAvailableTables, getTableById, createTable, updateTable, deleteTable, getTablesByRestaurant };
