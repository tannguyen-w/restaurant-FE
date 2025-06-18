import { Button } from "antd";
import logo from "../../../assets/icons/logo.svg";
import {
  AppstoreOutlined,
  MailOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet, Link } from "react-router-dom";
import { useAuth } from "../../../components/context/authContext";
import "./style.css";
import RevenueChart from "./revenueChart";
import { logout } from "../../../services/authService";


const DashboardStaff = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState("1");

  // Mapping URL paths to menu keys
  const pathToKeyMap = {
    "/staff/order": "1",
    "/staff/order/add": "2",
    "/staff/reservation": "3",
    "/staff/reservation/add": "4",
    "/staff/warehouse": "5",
    "/staff/warehouse/add": "6",
  };

  // Key to path mapping (reverse of the above)
  const keyToPathMap = {
    1: "/staff/order",
    2: "/staff/order/add",
    3: "/staff/reservation",
    4: "/staff/reservation/add",
    5: "/staff/warehouse",
    6: "/staff/warehouse/add",
  };

  // Set selected key based on current URL when component mounts
  useEffect(() => {
    const path = location.pathname;
    if (pathToKeyMap[path]) {
      setSelectedKey(pathToKeyMap[path]);
    }
  }, [location]);

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

  const items = [
    {
      key: "sub1",
      label: "Quản lý đơn hàng",
      icon: <MailOutlined />,
      children: [
        { key: "1", label: "Danh sách" },
        { key: "2", label: "Thêm mới" },
      ],
    },
    {
      key: "sub2",
      label: "Quản lý bàn đặt",
      icon: <AppstoreOutlined />,
      children: [
        { key: "3", label: "Danh sách" },
        { key: "4", label: "Thêm mới" },
      ],
    },
    {
      type: "divider",
    },
    {
      key: "sub4",
      label: "Quản lý kho",
      icon: <SettingOutlined />,
      children: [
        { key: "5", label: "Danh sách nguyên liệu" },
        { key: "6", label: "Nhập nguyên liệu" },
      ],
    },
  ];

  // Handle menu item click - navigate to the corresponding URL
  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
    if (keyToPathMap[key]) {
      navigate(keyToPathMap[key]);
    }
  };

  return (
    <>
      <div className="staff">
        <div className="containerR">
          <div className="staff-header">
            {/* Header content unchanged */}
            <div className="staff-header__logo">
              <Link to="/staff">
                <img
                  src={logo}
                  alt="Logo"
                  className="staff-header__thumbnail"
                />
              </Link>
              <div className="staff-header__rest">
                <div className="staff-header__rest-name">Vạn Hoa</div>
                <div className="staff-header__rest-sub">
                  Chi nhánh: {user.restaurant.name}
                </div>
                <div className="staff-header__rest-address">
                  Địa chỉ: {user.restaurant.address}
                </div>
              </div>
            </div>
            <div className="staff-info">
              <span className="staff-info__name">
                Xin chào, {user.full_name}
              </span>
              <span className="staff-info__role">
                Chức vụ: {user.role.description}
              </span>
            </div>
            <div onClick={handleLogout} className="staff-action">
              <Button type="primary">Đăng xuất</Button>
            </div>
          </div>

          <div className="staff-content">
            <Menu
              style={{ width: 256 }}
              selectedKeys={[selectedKey]}
              defaultOpenKeys={["sub1"]}
              mode="inline"
              items={items}
              onClick={handleMenuClick}
            />
            <div style={{ flex: 1 }}>
              {location.pathname === "/staff" ? <RevenueChart /> : <Outlet />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardStaff;
