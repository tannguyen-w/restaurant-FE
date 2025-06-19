import axios from "./axiosCustomize";

const getAllIngredientCategories = async (params) => {
  try {
    const response = await axios.get("/ingredient-category", {params});
    return response;
  } catch (error) {
    console.error("Error fetching all ingredient categories:", error);
    throw error;
  }
}

const getIngredientCategoryById = async (id) => {
  try {
    const response = await axios.get(`/ingredient-category/${id}`);
    return response;
  } catch (error) {
    console.error("Error fetching ingredient category by ID:", error);
    throw error;
  }
}

const createIngredientCategory = async (categoryData) => {
  try {
    const response = await axios.post("/ingredient-category", categoryData);
    return response;
  } catch (error) {
    console.error("Error creating ingredient category:", error);
    throw error;
  }
}

const updateIngredientCategory = async (id, categoryData) => {
  try {
    const response = await axios.put(`/ingredient-category/${id}`, categoryData);
    return response;
  } catch (error) {
    console.error("Error updating ingredient category:", error);
    throw error;
  }
}

const deleteIngredientCategory = async (id) => {
  try {
    const response = await axios.delete(`/ingredient-category/${id}`);
    return response;
  } catch (error) {
    console.error("Error deleting ingredient category:", error);
    throw error;
  }
}

export { getAllIngredientCategories, getIngredientCategoryById, createIngredientCategory, updateIngredientCategory, deleteIngredientCategory };