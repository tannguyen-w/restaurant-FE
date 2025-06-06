import axios from "./axiosCustomize";

const getDishCategories = async () => {
   try {
    const dishCategoriesData = await axios.get("/dish-category");
    return dishCategoriesData;
  } catch (error) {
    console.error("Error fetching all dish:", error);
    throw error;
  }
};

export { getDishCategories };
