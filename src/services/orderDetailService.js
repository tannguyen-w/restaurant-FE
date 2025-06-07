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

export { getOrderDetails, createOrderDetail };
