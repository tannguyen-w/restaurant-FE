import axiosClient from "./axiosClient";

// Đăng nhập
export async function login({ username, password }) {
  const res = await axiosClient.post("/login", { username, password });
  return res.data; // { user }
}

// Đăng ký
export async function register({ username, password, name }) {
  const res = await axiosClient.post("/user/register", { username, password, name });
  return res.data;
}

// Lấy thông tin user hiện tại
export async function getMe() {
  const res = await axiosClient.get("/user/me");
  return res.data;
}
