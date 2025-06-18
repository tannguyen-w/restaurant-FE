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

export { createIngredient, getAllIngredients };