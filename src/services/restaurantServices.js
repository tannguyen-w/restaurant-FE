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

export { getRestaurants };
