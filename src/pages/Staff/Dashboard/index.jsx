import { Button } from "antd";
import { Tabs } from "antd";
import logo from "../../../assets/icons/logo.svg";

const DashboardStaff = () => {
  const onChange = (key) => {
    console.log(key);
  };

  const items = [
    {
      key: "1",
      label: "Order",
      children: "Content of Tab Pane 1",
    },
    {
      key: "2",
      label: "Xác nhận đặt đơn",
      children: "Content of Tab Pane 2",
    },
    {
      key: "3",
      label: "Xác nhận đặt bàn",
      children: "Content of Tab Pane 3",
    },

    {
      key: "4",
      label: "Nhập nguyên liệu",
      children: "Content of Tab Pane 3",
    },
  ];

  return (
    <>
      <div className="staff">
        <div className="containerR">
          <div className="staff-header">
            <div className="staff-header__logo">
              <img src={logo} alt="Logo" className="staff-header__thumbnail" />
              <div className="staff-header__rest">
                <div className="staff-header__rest-name">Nhà hàng Vạn Hoa</div>
                <div className="staff-header__rest-sub">Cơ sở 1</div>
                <div className="staff-header__rest-address">123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh </div>
              </div>
            </div>
            <div className="staff-info">
              <span className="staff-info__name">Xin chào, Nguyễn Văn A</span>
              <span className="staff-info__role">Chức vụ: Nhân viên</span>
            </div>
            <div className="staff-action">
              <Button type="primary">Đăng xuất</Button>
            </div>
          </div>

          <div className="staff-content">
            <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardStaff;
