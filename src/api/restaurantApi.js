import axiosClient from "./axiosClient";

export async function fetchRestaurants() {
  const res = await axiosClient.get("/restaurants");
  return res.data;
}
