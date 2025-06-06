import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../components/context/authContext";
import { Spin } from "antd";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, isAppLoading } = useContext(AuthContext);
  const location = useLocation();

  // Chờ cho quá trình xác thực hoàn thành
  if (isAppLoading) {
    return (
      <div style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}>
        <Spin />
      </div>
    );
  }
// Chỉ kiểm tra khi đã xác thực xong
  if (!user) {
    // Lưu trang người dùng đang cố truy cập để sau khi đăng nhập có thể quay lại
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }
  
  // Kiểm tra quyền truy cập dựa trên vai trò
  if (!allowedRoles.includes(user.role.name)) {
    // Đưa người dùng về trang chủ phù hợp với vai trò của họ, thay vì luôn về login
    if (user.role.name === "customer") {
      return <Navigate to="/" />;
    } else if (user.role.name === "admin") {
      return <Navigate to="/admin" />;
    }
    
    // Fallback nếu không xác định được vai trò phù hợp
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;