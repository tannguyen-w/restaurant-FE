import { Button } from "antd";
import logo from "../../../assets/icons/logo.svg";
import { AppstoreOutlined, MailOutlined, SettingOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../../components/context/authContext";
import "./style.css";

const DashboardStaff = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState("1");

  // Mapping URL paths to menu keys
  const pathToKeyMap = {
    "/staff/order": "1",
    "/staff/order/add": "2",
    "/staff/reservation": "3",
    "/staff/reservation/add": "4",
    "/staff/table": "5",
    "/staff/inventory": "6",
    "/staff/inventory/add": "7",
  };

  // Key to path mapping (reverse of the above)
  const keyToPathMap = {
    1: "/staff/order",
    2: "/staff/order/add",
    3: "/staff/reservation",
    4: "/staff/reservation/add",
    5: "/staff/table",
    6: "/staff/inventory",
    7: "/staff/inventory/add",
  };

  // Set selected key based on current URL when component mounts
  useEffect(() => {
    const path = location.pathname;
    if (pathToKeyMap[path]) {
      setSelectedKey(pathToKeyMap[path]);
    }
  }, [location]);

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
        { key: "5", label: "Trạng thái" },
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
        { key: "6", label: "Danh sách nguyên liệu" },
        { key: "7", label: "Nhập nguyên liệu" },
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
              <img src={logo} alt="Logo" className="staff-header__thumbnail" />
              <div className="staff-header__rest">
                <div className="staff-header__rest-name">Vạn Hoa</div>
                <div className="staff-header__rest-sub">Chi nhánh: {user.restaurant.name}</div>
                <div className="staff-header__rest-address">Địa chỉ: {user.restaurant.address}</div>
              </div>
            </div>
            <div className="staff-info">
              <span className="staff-info__name">Xin chào, {user.full_name}</span>
              <span className="staff-info__role">Chức vụ: {user.role.description}</span>
            </div>
            <div className="staff-action">
              <Button type="primary">Đăng xuất</Button>
            </div>
          </div>

          <div className="staff-content">
            <Menu
              style={{ width: 256 }}
              selectedKeys={[selectedKey]}
              defaultSelectedKeys={["1"]}
              defaultOpenKeys={["sub1"]}
              mode="inline"
              items={items}
              onClick={handleMenuClick}
            />
            <div style={{ flex: 1 }}>
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardStaff;
