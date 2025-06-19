import axios from "./axiosCustomize";

const createDishIngredient = async (data) => {
  try {
    const response = await axios.post("/dish-ingredient", data);
    return response;
  } catch (error) {
    console.error("Error creating dish ingredient:", error);
    throw error;
  }
}

const getByDish = async (dishId) => {
  try {
    const response = await axios.get(`/dish-ingredient/dish/${dishId}`, );
    return response;
  } catch (error) {
    console.error("Error fetching dish ingredients:", error);
    throw error;
  }
}

const getByIngredient = async (ingredientId) => {
  try {
    const response = await axios.get(`/dish-ingredient/ingredient/${ingredientId}`, );
    return response;
  } catch (error) {
    console.error("Error fetching dish ingredients by ingredient ID:", error);
    throw error;
  }
}

const getById = async (id) => {
  try {
    const response = await axios.get(`/dish-ingredient/${id}`);
    return response;
  } catch (error) {
    console.error("Error fetching dish ingredient by ID:", error);
    throw error;
  }
}

const updateDishIngredient = async (id, data) => {
  try {
    const response = await axios.put(`/dish-ingredient/${id}`, data);
    return response;
  } catch (error) {
    console.error("Error updating dish ingredient:", error);
    throw error;
  }
}

const deleteDishIngredient = async (id) => {
  try {
    const response = await axios.delete(`/dish-ingredient/${id}`);
    return response;
  } catch (error) {
    console.error("Error deleting dish ingredient:", error);
    throw error;
  }
}   

export { createDishIngredient, getByDish, getByIngredient, getById, updateDishIngredient, deleteDishIngredient };