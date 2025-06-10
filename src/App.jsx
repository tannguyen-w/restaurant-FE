import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicRoutes from "./routes/PublicRoutes";
import CustomerRoutes from "./routes/CustomerRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import StaffRoutes from "./routes/StaffRoutes";
import NotFound from "./pages/public/NotFound";
import { useContext, useEffect } from "react";
import { getInfo } from "./services/userSevices";
import { AuthContext } from "./components/context/authContext";
import { Spin } from "antd";
import { ToastContainer } from "react-toastify";

const App = () => {
  const { setUser, isAppLoading, setIsAppLoading } = useContext(AuthContext);

  // Thêm console.log để debug
  console.log("App component render");

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // Gọi API để kiểm tra xác thực - cookies sẽ tự động được gửi
        const userData = await getInfo();

        if (userData && userData.id) {
          setUser(userData);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        // Nếu gặp lỗi 401, đã xử lý trong axiosCustomize.js
      } finally {
        setIsAppLoading(false);
      }
    };

    // LUÔN gọi fetchUserInfo(), cookies sẽ được gửi tự động
    // Nếu không có cookies hoặc không hợp lệ, API sẽ trả về 401
    fetchUserInfo();
  }, []);

  return (
    <>
      {isAppLoading === true ? (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Spin />
        </div>
      ) : (
        <>
          <BrowserRouter>
            <Routes>
              {PublicRoutes}
              {CustomerRoutes}
              {AdminRoutes}
              {StaffRoutes}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </>
      )}
    </>
  );
};

export default App;
