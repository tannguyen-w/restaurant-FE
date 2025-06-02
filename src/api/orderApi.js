import axiosClient from "./axiosClient";

export async function createOrder(data) {
  const res = await axiosClient.post("/order", data);
  return res.data;
}
