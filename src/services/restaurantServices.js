import axios from "./axiosCustomize";

const getRestaurants = async () => {
   try {
    // Vì interceptor đã trả về response.data nên không cần .data nữa
    const restaurantData = await axios.get("/restaurants");
    return restaurantData;
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
};

const deleteRestaurant = async (id) => {
  try {
    const response = await axios.delete(`/restaurants/${id}`);
    return response;
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    throw error;
  }
};

const updateRestaurant = async (id, data) => {
  try {
    const response = await axios.put(`/restaurants/${id}`, data);
    return response;
  } catch (error) {
    console.error("Error updating restaurant:", error);
    throw error;
  }
};

const addRestaurant = async (data) => {
  try {
    const response = await axios.post("/restaurants", data);
    return response;
  } catch (error) {
    console.error("Error adding restaurant:", error);
    throw error;
  }
}

const getRestaurantById = async (id) => {
  try {
    const response = await axios.get(`/restaurants/${id}`);
    return response;
  } catch (error) {
    console.error("Error fetching restaurant by ID:", error);
    throw error;
  }
}

export { getRestaurants,deleteRestaurant,updateRestaurant,addRestaurant,getRestaurantById };
