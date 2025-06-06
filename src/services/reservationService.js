import axios from "./axiosCustomize";

const createReservation = async (reservationData) => {
  try {
    const response = await axios.post("/reservation", reservationData);
    return response.data;
  } catch (error) {
    console.error("Error creating reservation:", error);
    throw error;
  }
}

const getMyReservations = async () => {
  try {
    const response = await axios.get(`/reservations/my-reservations`);
    return response.data;
  } catch (error) {
    console.error("Error fetching reservations:", error);
    throw error;
  }
};

export {createReservation, getMyReservations}