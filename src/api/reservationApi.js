import axiosClient from "./axiosClient";

export async function createReservation(data) {
  const res = await axiosClient.post("/reservation", data);
  return res.data;
}
