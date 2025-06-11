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

const checkTableReservation = async ({ tableId, date, time }) => {
  const res = await axios.get(`/reservation/${tableId}/check-reservation`, {
    params: { date, time },
  });
  // Giả sử BE trả về { reserved: true/false }
  console.log("Check table reservation response:", res);
  return res;
};

export { createReservation, getMyReservations, checkTableReservation };
