import axios from "./axiosCustomize";

const getStatistics = async (restaurantId = null, params = {}) => {
  try {
    const queryParams = restaurantId ? { ...params, restaurantId } : params;
    const response = await axios.get(`/dashboard/stats`, { params: queryParams });
    return response;
  } catch (error) {
    console.error("Error fetching statistics:", error);
    throw error;
  }
};

export { getStatistics };
