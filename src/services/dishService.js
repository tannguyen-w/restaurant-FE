import axios from "./axiosCustomize";

const getDishes = async () => {
  try {
    const dishesData = await axios.get("/dishes");
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

export { getDishes, getDishById, getDishesByRestaurant };
