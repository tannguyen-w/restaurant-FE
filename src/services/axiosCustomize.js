import axios from "axios";
import NProgress from "nprogress";

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 100,
});

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // QUAN TRỌNG: cho phép gửi/nhận cookies với mỗi request
  // headers: {
  //   "Content-Type": "application/json",
  // }
  // Theo ChatGPT, không cần thiết phải đặt Content-Type là application/json
  // Với API dùng JSON: Axios tự set application/json
  // Với API dùng FormData: Axios tự set multipart/form-data với boundary ✅
  // Có cái "Content-Type": "application/json", không cần thiết vì Axios sẽ tự động xử lý
});

// Interceptor cho requests
instance.interceptors.request.use(
  (config) => {
    NProgress.start();
    // Không cần thêm Authorization header vì cookies HttpOnly sẽ tự động được gửi
    // không thể đọc HttpOnly cookies bằng JavaScript
    return config;
  },
  (error) => {
    NProgress.done();
    return Promise.reject(error);
  }
);

// Interceptor cho responses
instance.interceptors.response.use(
  function (response) {
    NProgress.done();
    return response.data;
  },
  function (error) {
    NProgress.done();

    // Xử lý lỗi 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      // Không cần xóa cookies vì chỉ server mới có thể xóa HttpOnly cookies

      // Xóa các giá trị lưu trong localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("cartItems");
    }
    return Promise.reject(error);
  }
);

export default instance;
