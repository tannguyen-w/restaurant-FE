import { Menu, Avatar, Popover } from "antd";
import { useNavigate } from "react-router-dom";
import "./LayoutAdmin.scss"
const LayoutAdmin = ({children}) => {
    const navigate = useNavigate();
   const logout = () => {
    console.log("Đăng xuất");
  };
      const contentAccount = (
    <div>
      <p>Đây là Admin</p>
      <p>My Profile</p>
      <p>Đổi mật khẩu</p>
      <p onClick={logout} style={{ cursor: "pointer" }}>
        Đăng xuất
      </p>
    </div>
  );
  return (
               <div className="dasboard">
      <aside className="left-site">
        <div>
          <div className="brand-name d-flex align-items-center justify-content-between">
            <div className="name-brand text-nowrap mt-3">
              <img src="/src/assets/icons/logoblack.svg" width={250} />
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
                //   disabled: role === 2 ? false : true,
                  children: [
                    {
                      key: "3",
                      label: "Thêm mới nhân viên",
                      onClick: () => navigate("/admin/users/add"),
                    },
                    {
                      key: "4",
                      label: "Danh sách nhân viên",
                      onClick: () => navigate("/admin/user/list"),
                    },
                  ],
                },

                {
                  key: "5",
                  label: "Quản lý nhà hàng",
                //   disabled: role === 2 ? false : true,
                  children: [
                    {
                      key: "6",
                      label: "Thêm mới nhà hàng",
                      onClick: () => navigate("/admin/restaurant/add"),
                    },
                    {
                      key: "7",
                      label: "Danh sách nhà hàng",
                      onClick: () => navigate("/admin/restaurant/list"),
                    },
                  ],
                },
                {
                  key: "8",
                  label: "Dish",
                //   disabled: role === 2 ? false : true,
                  children: [
                    {
                      key: "9",
                      label: "Add Dish",
                      onClick: () => navigate("/admin/dish/add"),
                    },
                    {
                      key: "10",
                      label: "List Dish",
                      onClick: () => navigate("/admin/dish/list"),
                    },
                  ],
                },
                {
                  key: "12",
                  label: "Dish Category",
                //   disabled: role === 2 ? false : true,
                  children: [
                    {
                      key: "13",
                      label: "Add Dish Category",
                      onClick: () => navigate("/admin/category/add"),
                    },
                    {
                      key: "14",
                      label: "List Dish Category",
                      onClick: () => navigate("/admin/category/list"),
                    },
                  ],
                },
                {
                  key: "15",
                  label: "Quản lý nhà cung cấp",
                //   disabled: role === 2 ? false : true,
                  children: [
                    {
                      key: "16",
                      label: "Thêm mới nhà cung cấp",
                      onClick: () => navigate("/admin/supplier/add"),
                    },
                    {
                      key: "17",
                      label: "Danh sách nhà cung cấp",
                      onClick: () => navigate("/admin/supplier/list"),
                    },
                  ],
                },
                {
                  key: "18",
                  label: "Ingredient Category",
                //   disabled: role === 2 ? false : true,
                  children: [
                    {
                      key: "19",
                      label: "Add Ingredient Category",
                      onClick: () => navigate("/admin/ingredient-category/add"),
                    },
                    {
                      key: "20",
                      label: "List Ingredient Category",
                      onClick: () => navigate("/admin/ingredient-category/list"),
                    },
                  ],
                },
                {
                  key: "20",
                  label: "Ingredient",
                //   disabled: role === 2 ? false : true,
                  children: [
                    {
                      key: "21",
                      label: "Add Ingredient",
                      onClick: () => navigate("/admin/ingredient/add"),
                    },
                    {
                      key: "22",
                      label: "List Ingredient",
                      onClick: () => navigate("/admin/ingredient/list"),
                    },
                  ],
                },
                {
                  key: "26",
                  label: "Quản lý bàn",
                //   disabled: role === 2 ? false : true,
                  children: [
                    {
                      key: "27",
                      label: "Thêm mới bàn",
                      onClick: () => navigate("/admin/table/add"),
                    },
                    {
                      key: "28",
                      label: "Danh sách bàn",
                      onClick: () => navigate("/admin/table/list"),
                    },
                  ],
                },
                {
                  key: "29",
                  label: "Combo Management",
                //   disabled: role === 2 ? false : true,
                  children: [
                    {
                      key: "30",
                      label: "Add Combo",
                      onClick: () => navigate("/admin/table/add"),
                    },
                    {
                      key: "31",
                      label: "List Combo",
                      onClick: () => navigate("/admin/table/list"),
                    },
                  ],
                },
                {
                  key: "32",
                  label: "Import Invoice",
                //   disabled: role === 2 ? false : true,
                  children: [
                    {
                      key: "30",
                      label: "Add Import Invoice",
                      onClick: () => navigate("/admin/import-invoice/add"),
                    },
                    {
                      key: "31",
                      label: "List Import Invoice",
                      onClick: () => navigate("/admin/import-invoice/list"),
                    },
                  ],
                },
                 {
                  key: "35",
                  label: "Dish Ingredient",
                //   disabled: role === 2 ? false : true,
                  children: [
                    {
                      key: "36",
                      label: "Add Dish Ingredient",
                      onClick: () => navigate("/admin/dish-ingredient/add"),
                    },
                    {
                      key: "37",
                      label: "List Dish Ingredient",
                      onClick: () => navigate("/admin/dish-ingredient/list"),
                    },
                  ],
                },
                {
                  key: "38",
                  label: "Reservation",
                //   disabled: role === 2 ? false : true,
                  children: [
                    {
                      key: "39",
                      label: "Add Reservation",
                      onClick: () => navigate("/admin/reservation/add"),
                    },
                    {
                      key: "40",
                      label: "List Reservation",
                      onClick: () => navigate("/admin/reservation/list"),
                    },
                  ],
                },
                {
                  key: "41",
                  label: "Order",
                //   disabled: role === 2 ? false : true,
                  children: [
                    {
                      key: "42",
                      label: "Add Order",
                      onClick: () => navigate("/admin/order/add"),
                    },
                    {
                      key: "43",
                      label: "List Order",
                      onClick: () => navigate("/admin/order/list"),
                    },
                  ],
                },
                {
                  key: "44",
                  label: "Member Card",
                //   disabled: role === 2 ? false : true,
                  children: [
                    {
                      key: "45",
                      label: "Add Member Card",
                      onClick: () => navigate("/admin/member-card/add"),
                    },
                    {
                      key: "46",
                      label: "List Member Card",
                      onClick: () => navigate("/admin/member-card/list"),
                    },
                  ],
                },
                {
                  key: "11",
                  label: "Invoice",
                  onClick: () => navigate("/admin/invoice"),
                },
              ]}
            />
          </div>
        </div>
      </aside>
      <div className="body-wrapper">
        <header className="app-header">
          <nav className="navbar navbar-expand-lg navbar-light">
            <div className="navbar-collapse justify-content-end px-0">
              <Popover
                content={contentAccount}
                title="Account"
                trigger="click"
                placement="bottomLeft"
              >
                <Avatar>A</Avatar>
              </Popover>
            </div>
          </nav>
        </header>
        <div className="container mt-3 layout-admin">{children}</div>
      </div>
    </div>
  );
};
export default LayoutAdmin;
