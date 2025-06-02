import axiosClient from "./axiosClient";

export async function fetchDishesByRestaurant(restaurantId) {
  const res = await axiosClient.get(`/dishes?restaurant=${restaurantId}`);
  return res.data;
}
