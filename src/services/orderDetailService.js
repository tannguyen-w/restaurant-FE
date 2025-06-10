import axios from "./axiosCustomize";

const getOrderDetails = async () => {
  try {
    const orderDetailData = await axios.get("/order-detail/all");
    return orderDetailData;
  } catch (error) {
    console.error("Error fetching all order details:", error);
    throw error;
  }
};

const createOrderDetail = async (data) => {
  try {
    const response = await axios.post("/order-detail", data);
    return response;
  } catch (error) {
    console.error("Error creating order detail:", error);
    throw error;
  }
};

const getOrderDetailById = async (id) => {
  try {
    const response = await axios.get(`/order-detail/order/${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching order detail with ID ${id}:`, error);
    throw error;
  }
};

export { getOrderDetails, createOrderDetail, getOrderDetailById };
