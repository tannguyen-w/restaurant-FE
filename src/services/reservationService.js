import axios from "./axiosCustomize";

const createReservation = async (reservationData) => {
  try {
    const response = await axios.post("/reservation", reservationData);
    return response.data;
  } catch (error) {
    console.error("Error creating reservation:", error);
    throw error;
  }
};

const getMyReservations = async (params) => {
  try {
    const response = await axios.get(`/reservation/me`, { params });
    return response;
  } catch (error) {
    console.error("Error fetching reservations:", error);
    throw error;
  }
};

const getReservationsByRestaurant = async (restaurantId, params) => {
  try {
    const response = await axios.get(`/reservation/restaurant/${restaurantId}`, { params });
    return response;
  } catch (error) {
    console.error("Error fetching reservations by table:", error);
    throw error;
  }
};

const checkTableReservation = async ({ tableId, date, time }) => {
  const res = await axios.get(`/reservation/${tableId}/check-reservation`, {
    params: { date, time },
  });
  // Giả sử BE trả về { reserved: true/false }
  console.log("Check table reservation response:", res);
  return res;
};

const updateReservation = async (id, data) => {
  try {
    const response = await axios.put(`/reservation/${id}`, data);
    return response;
  } catch (error) {
    console.error("Error updating reservation:", error);
    throw error;
  }
};

export { createReservation, getMyReservations, checkTableReservation, getReservationsByRestaurant, updateReservation };
