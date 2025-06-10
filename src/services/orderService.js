import axios from "./axiosCustomize";

const createOrder = async (orderData) => {
  try {
    const response = await axios.post("/order", orderData);
    return response;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

const getMyOrders = async (params) => {
  try {
    const response = await axios.get("/order/my-orders", { params });

    return response;
  } catch (error) {
    console.error("Error fetching my orders:", error);
    throw error;
  }
};

export { createOrder, getMyOrders };
