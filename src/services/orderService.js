import axios from "./axiosCustomize";

const CreateOrder = async (orderData) => {
  try {
    const response = await axios.post("/order", orderData);
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

const getMyOrders = async () => {
  try {
    const response = await axios.get("/order/my-orders");
    return response.data;
  } catch (error) {
    console.error("Error fetching my orders:", error);
    throw error;
  }
}


export { CreateOrder, getMyOrders };