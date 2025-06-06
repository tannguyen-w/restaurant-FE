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

export { getOrderDetails };
