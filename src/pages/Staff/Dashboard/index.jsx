import { Button } from "antd";
import logo from "../../../assets/icons/logo.svg";
import { AppstoreOutlined, MailOutlined, SettingOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import { useState } from "react";
import OrderList from "../Order/orderList";
import OrderAdd from "../Order/orderAdd";
import { useAuth } from "../../../components/context/authContext";

import "./style.css";
import ReservationList from "../Reservation/ReservationList";
import ReservationAdd from "../Reservation/ReservationAdd";

const DashboardStaff = () => {
  const { user } = useAuth();
  const [selectedKey, setSelectedKey] = useState("1");

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

  const renderContent = () => {
    if (selectedKey === "1") return <OrderList />;
    if (selectedKey === "2") return <OrderAdd />;
    if (selectedKey === "3") return <ReservationList />;
    if (selectedKey === "4") return <ReservationAdd />;
    // Có thể bổ sung các case khác ở đây
    return <div style={{ minHeight: 400 }} />;
  };

  return (
    <>
      <div className="staff">
        <div className="containerR">
          <div className="staff-header">
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
              onClick={({ key }) => setSelectedKey(key)}
            />
            <div style={{ flex: 1 }}>{renderContent()}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardStaff;
