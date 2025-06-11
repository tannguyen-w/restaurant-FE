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

export { getAllTables, getAvailableTables, getTablesByRestaurant };
