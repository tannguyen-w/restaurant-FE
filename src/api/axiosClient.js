import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8888/v1/api", // điều chỉnh nếu backend chạy port khác
  withCredentials: true, // Hỗ trợ cookie httpOnly nếu backend set
});

// Interceptor xử lý response lỗi chung (tuỳ chọn)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Có thể show toast, redirect login, v.v.
    return Promise.reject(error);
  }
);

export default axiosClient;
