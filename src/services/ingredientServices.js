import axios from "./axiosCustomize";

const createIngredient = async (ingredientData) => {
  try {
    const response = await axios.post("/ingredient", ingredientData);
    return response;
  } catch (error) {
    console.error("Error creating ingredient:", error);
    throw error;
  }
}

const getAllIngredients = async (params) => {
  try {
    const response = await axios.get("/ingredient", { params });
    return response;
  } catch (error) {
    console.error("Error fetching all ingredients:", error);
    throw error;
  }
}

const getIngredientById = async (id) => {
  try {
    const response = await axios.get(`/ingredient/${id}`);
    return response;
  } catch (error) {
    console.error("Error fetching ingredient by ID:", error);
    throw error;
  }
}

const updateIngredient = async (id, ingredientData) => {
  try {
    const response = await axios.put(`/ingredient/${id}`, ingredientData);
    return response;
  } catch (error) {
    console.error("Error updating ingredient:", error);
    throw error;
  }
}

const deleteIngredient = async (id) => {
  try {
    const response = await axios.delete(`/ingredient/${id}`);
    return response;
  } catch (error) {
    console.error("Error deleting ingredient:", error);
    throw error;
  }
}

export { createIngredient, getAllIngredients,getIngredientById, updateIngredient, deleteIngredient };