import axios from "./axiosCustomize";

const getDishes = async (params) => {
  try {
    const dishesData = await axios.get("/dishes", {params });
    return dishesData;
  } catch (error) {
    console.error("Error fetching all dish:", error);
    throw error;
  }
};

const getDishById = async (id) => {
  try {
    const dishData = await axios.get(`/dishes/${id}`);
    return dishData;
  } catch (error) {
    console.error(`Error fetching dish with id ${id}:`, error);
    throw error;
  }
};

const getDishesByRestaurant = async (restaurantId) => {
  try {
    const dishesData = await axios.get(`/dishes/restaurant/${restaurantId}`);
    return dishesData;
  } catch (error) {
    console.error(`Error fetching dishes for restaurant ${restaurantId}:`, error);
    throw error;
  }
};

const deleteDish = async (id) => {
  try {
    const response = await axios.delete(`/dishes/${id}`);
    return response;
  } catch (error) {
    console.error(`Error deleting dish with id ${id}:`, error);
    throw error;
  }
};

const createDish = async (data) => {
  try {
    const response = await axios.post("/dishes", data);
    return response;
  } catch (error) {
    console.error("Error creating dish:", error);
    throw error;
  }
};

const updateDish = async (id, formData) => {
  try {
    const response = await axios.put(`/dishes/${id}`, formData);
    return response;
  } catch (error) {
    console.error(`Error updating dish with id ${id}:`, error);
    throw error;
  }
};

const addComboItem = async (data) => {
  try {
    const response = await axios.post("/combo", data);
    return response;
  } catch (error) {
    console.error("Error adding combo item:", error);
    throw error;
  }
};

const getComboItems = async (comboId) => {
  try {
    const response = await axios.get(`/combo/${comboId}`);
    return response;
  } catch (error) {
    console.error(`Error fetching combo items for combo ${comboId}:`, error);
    throw error;
  }
};

export { getDishes, getDishById, getDishesByRestaurant , deleteDish, createDish, updateDish, addComboItem, getComboItems };
