import { Menu, Button, Spin } from "antd";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "./LayoutAdmin.scss";
import { logout } from "../services/authService";
import { useAuth } from "../components/context/authContext";
import { useEffect, useState } from "react";
import {
  CalendarOutlined,
  CoffeeOutlined,
  ContactsOutlined,
  DashboardOutlined,
  FileTextOutlined,
  ImportOutlined,
  InboxOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  TableOutlined,
  UserOutlined,
} from "@ant-design/icons";

const LayoutAdmin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useAuth();

  const [currentRestaurant, setCurrentRestaurant] = useState(null);

  // Xử lý chuyển đổi nhà hàng
  useEffect(() => {
    if (user && user.restaurant && user.restaurant.id !== currentRestaurant) {
      setLoading(true);
      setCurrentRestaurant(user.restaurant.id);

      // Giả lập thời gian tải dữ liệu (thay thế bằng API call thực tế)
      setTimeout(() => {
        setLoading(false);
      }, 600);
    }
  }, [user, currentRestaurant]);

  const handleLogout = async () => {
    try {
      await logout(); // Gọi API đăng xuất

      // Cập nhật trạng thái đăng nhập trong context
      setUser(null);

      // Xóa token và thông tin người dùng từ localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Chuyển hướng về trang đăng nhập
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="dashboard">
      <aside className="left-site">
        <div>
          <div className="brand-name d-flex align-items-center justify-content-between">
            {user && user.role.name === "admin" && (
              <>
                <Link to="/admin/dashboard">
                  <div className="name-brand text-nowrap mt-3">
                    <img src="/src/assets/icons/logoblack.svg" width={50} />
                  </div>
                </Link>
              </>
            )}
          </div>
          <div className="slide-bar-menu mt-3">
            <Menu
              mode="inline"
              items={[
                {
                  key: "1",
                  icon: <DashboardOutlined />,
                  label: "Thông tin quản trị",
                  onClick: () => navigate("/admin/dashboard"),
                },
                {
                  key: "2",
                  icon: <UserOutlined />,
                  label: "Quản lý nhân viên",
                  onClick: () => navigate("/admin/user"),
                },
                {
                  key: "5",
                  icon: <ShopOutlined />,
                  label: "Quản lý nhà hàng",
                  onClick: () => navigate("/admin/restaurant"),
                },
                {
                  key: "8",
                  icon: <CoffeeOutlined />,
                  label: "Quản lý món ăn",
                  onClick: () => navigate("/admin/dishes"),
                },
                {
                  key: "15",
                  icon: <ContactsOutlined />,
                  label: "Quản lý nhà cung cấp",
                  onClick: () => navigate("/admin/supplier"),
                },
                {
                  key: "26",
                  icon: <TableOutlined />,
                  label: "Quản lý bàn",
                  onClick: () => navigate("/admin/table"),
                },
                {
                  key: "20",
                  icon: <InboxOutlined />,
                  label: "Quản lý nguyên liệu",
                  onClick: () => navigate("/admin/ingredient"),
                },

                {
                  key: "29",
                  icon: <FileTextOutlined />,
                  label: "Quản lý công thức",
                  onClick: () => navigate("/admin/recipes"),
                },
                {
                  key: "30",
                  icon: <ImportOutlined />,
                  label: "Quản lý nhập kho",
                  onClick: () => navigate("/admin/warehouse"),
                },
                {
                  key: "38",
                  icon: <CalendarOutlined />,
                  label: "Quản lý đặt bàn",
                  onClick: () => navigate("/admin/reservation"),
                },
                {
                  key: "41",
                  icon: <ShoppingCartOutlined />,
                  label: "Quản lý đơn hàng",
                  onClick: () => navigate("/admin/order"),
                },
              ]}
            />
          </div>
        </div>
      </aside>
      <div className="body-wrapper">
        <header className="app-header">
          <div className="staff-header">
            {/* Header content unchanged */}
            <div className="staff-header__logo">
              <div className="staff-header__rest">
                {user && user.role.name === "admin" && (
                  <>
                    <Link to="/admin/dashboard">
                      <h2 className="staff-header__rest-name--admin">Vạn Hoa</h2>
                    </Link>
                  </>
                )}

                {user && user.role.name !== "admin" && (
                  <>
                    <Link to="/manager/dashboard">
                      <div className="staff-header__rest-name">Vạn Hoa</div>
                    </Link>
                    <div className="staff-header__rest-sub">Chi nhánh: {user?.restaurant?.name}</div>
                    <div className="staff-header__rest-address">Địa chỉ: {user?.restaurant?.address}</div>
                  </>
                )}
              </div>
            </div>
            <div className="staff-info">
              <span className="staff-info__name">Xin chào, {user.full_name}</span>
              <span className="staff-info__role">Chức vụ: {user.role.description}</span>
            </div>
            <div onClick={handleLogout} className="staff-action">
              <Button type="primary">Đăng xuất</Button>
            </div>
          </div>
        </header>
        {/* Wrapper cho nội dung với trạng thái loading */}
        <div className={`content-wrapper ${loading ? "content-loading" : ""}`}>
          {loading && (
            <div className="loading-spinner">
              <Spin size="large" tip="Đang tải dữ liệu nhà hàng..." />
            </div>
          )}
          <Outlet />
        </div>
      </div>
    </div>
  );
};
export default LayoutAdmin;
