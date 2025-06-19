import { Menu,  Button } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import "./LayoutAdmin.scss";
import { logout } from "../services/authService";
import { useAuth } from "../components/context/authContext";



const LayoutAdmin = () => {
  const navigate = useNavigate();
   const { user, setUser } = useAuth();

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
            <div className="name-brand text-nowrap mt-3">
              <img src="/src/assets/icons/logoblack.svg" width={50} />
            </div>
          </div>
          <div className="slide-bar-menu mt-3">
            <Menu
              mode="inline"
              items={[
                {
                  key: "1",
                  label: "Thông tin quản trị",
                  //   disabled: role === 2 ? false : true,
                  onClick: () => navigate("/admin/dashboard"),
                },
                {
                  key: "2",
                  label: "Quản lý nhân viên",
                  onClick: () => navigate("/admin/user"),
                },

                {
                  key: "5",
                  label: "Quản lý nhà hàng",
                  onClick: () => navigate("/admin/restaurant"),
                },
                {
                  key: "8",
                  label: "Quản lý món ăn",
                  onClick: () => navigate("/admin/dishes"),
                  
                },
                {
                  key: "15",
                  label: "Quản lý nhà cung cấp",
                  onClick: () => navigate("/admin/supplier"),
                },
                   {
                  key: "26",
                  label: "Quản lý bàn",
                    onClick: () => navigate("/admin/table"),
                 
                },
                {
                  key: "20",
                  label: "Quản lý nguyên liệu",
                  onClick: () => navigate("/admin/ingredient"),
                },
                
                {
                  key: "29",
                  label: "Quản lý công thức",
                   onClick: () => navigate("/admin/recipes"),
                },
                {
                  key: "30",
                  label: "Quản lý nhập kho",
                   onClick: () => navigate("/admin/warehouse"),
                },
                {
                  key: "38",
                  label: "Quản lý đặt bàn",
                   onClick: () => navigate("/admin/reservation"),
                },
                {
                  key: "41",
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
        </header>
        <div className="container mt-3 layout-admin"><Outlet/></div>
      </div>
    </div>
  );
};
export default LayoutAdmin;
