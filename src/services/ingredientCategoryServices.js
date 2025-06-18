import axios from "./axiosCustomize";

const getAllIngredientCategories = async () => {
  try {
    const response = await axios.get("/ingredient-category");
    return response;
  } catch (error) {
    console.error("Error fetching all ingredient categories:", error);
    throw error;
  }
}

export { getAllIngredientCategories };