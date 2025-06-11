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

const getAllOrders = async (params) => {
  try {
    const response = await axios.get("/order", { params });
    return response;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    throw error;
  }
};

const getOrdersByRestaurant = async (restaurantId, params) => {
  try {
    const response = await axios.get(`/order/restaurant/${restaurantId}`, { params });
    return response;
  } catch (error) {
    console.error("Error fetching orders by restaurant:", error);
    throw error;
  }
};

const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await axios.put(`/order/${orderId}`, { status });
    return response;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

const updateOrder = async (orderId, orderData) => {
  try {
    const response = await axios.put(`/order/${orderId}`, orderData);
    return response;
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
};

export { createOrder, getMyOrders, getAllOrders, getOrdersByRestaurant, updateOrderStatus, updateOrder };
