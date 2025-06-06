import NavCustomer from "../../../components/NavCustomer";
import Footer from "../../../components/layouts/footer";

import {  NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../../components/context/authContext";
import { useEffect, useState } from "react";

import personalIcon from "../../../assets/icons/personal.svg";
import addressIcon from "../../../assets/icons/address.svg";
import messageIcon from "../../../assets/icons/message.svg";
import downloadIcon from "../../../assets/icons/download.svg";
import heartIcon from "../../../assets/icons/heart.svg";
import giftSmallIcon from "../../../assets/icons/gift-small.svg";
import protectIcon from "../../../assets/icons/protect.svg";
import helpIcon from "../../../assets/icons/help.svg";
import dangerIcon from "../../../assets/icons/danger.svg";
import avatarImage from "../../../assets/images/avatar.jpg";

const Profile = () => {
  const { user } = useAuth();

  const [userProfile, setUserProfile] = useState({
    name: "Đang tải...",
    email: "Đang tải...",
    phone: "Đang tải...",
    address: "Chưa có địa chỉ",
  });



  useEffect(() => {
    if (user) {
      setUserProfile({
        name: user.full_name || user.username || "Người dùng",
        email: user.email || "Chưa cập nhật email",
        phone: user.phone || "Chưa cập nhật số điện thoại",
        address: user.address || "Chưa cập nhật địa chỉ",
      });
    }
  }, [user]);
  return (
    <>
      <NavCustomer />
      <main className="profile">
        <div className="containerR">
          {/* <!-- Profile content --> */}
          <div className="profile__container">
            <div className="row gy-md-3">
              <div className="col-3 col-xl-4 col-lg-5 col-md-12">
                <aside className="profile__sidebar">
                  {/* <!-- User --> */}
                  <div className="profile-user">
                    <img
                      src={
                        user && user.avatar
                          ? `http://localhost:8081${user.avatar}`
                          : avatarImage
                      }
                      alt=""
                      className="profile-user__avatar"
                    />
                    <h1 className="profile-user__name">{userProfile.name}</h1>
                    <p className="profile-user__desc">
                      Email: {userProfile.email}
                    </p>
                  </div>

                  {/* <!-- Menu 1 --> */}
                  <div className="profile-menu">
                    <h3 className="profile-menu__title">Quản lý tài khoản</h3>
                    <ul className="profile-menu__list">
                      <li>
                        <NavLink
                          to={"/profile/edit"}
                          className={({ isActive }) =>
                            isActive
                              ? "profile-menu__link active"
                              : "profile-menu__link"
                          }
                        >
                          <span className="profile-menu__icon">
                            <img src={personalIcon} alt="" className="icon" />
                          </span>
                          Thông tin cá nhân
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to={"/profile/edit"}
                          className={({ isActive }) =>
                            isActive
                              ? "profile-menu__link active"
                              : "profile-menu__link"
                          }
                        >
                          <span className="profile-menu__icon">
                            <img src={addressIcon} alt="" className="icon" />
                          </span>
                          Địa chỉ
                        </NavLink>
                      </li>
                      <li>
                        <a href="#!" className="profile-menu__link">
                          <span className="profile-menu__icon">
                            <img src={messageIcon} alt="" className="icon" />
                          </span>
                          Riêng tư & bảo mật
                        </a>
                      </li>
                    </ul>
                  </div>

                  {/* <!-- Menu 2 --> */}
                  <div className="profile-menu">
                    <h3 className="profile-menu__title">Đơn hàng của tôi</h3>
                    <ul className="profile-menu__list">
                      <li>
                        <NavLink
                          to="/profile/orders"
                          className={({ isActive }) =>
                            isActive
                              ? "profile-menu__link active"
                              : "profile-menu__link"
                          }
                        >
                          <span className="profile-menu__icon">
                            <img src={downloadIcon} alt="" className="icon" />
                          </span>
                          Đơn hàng đã đặt
                        </NavLink>
                      </li>
                      <li>
                        <a href="#!" className="profile-menu__link">
                          <span className="profile-menu__icon">
                            <img src={heartIcon} alt="" className="icon" />
                          </span>
                          Yêu thích
                        </a>
                      </li>
                      <li>
                        <a href="#!" className="profile-menu__link">
                          <span className="profile-menu__icon">
                            <img src={giftSmallIcon} alt="" className="icon" />
                          </span>
                          Ưu đãi
                        </a>
                      </li>
                    </ul>
                  </div>

                  {/* <!-- Menu 3 --> */}
                  <div className="profile-menu">
                    <h3 className="profile-menu__title">Đăng ký và gói</h3>
                    <ul className="profile-menu__list">
                      <li>
                        <a href="#!" className="profile-menu__link">
                          <span className="profile-menu__icon">
                            <img src={protectIcon} alt="" className="icon" />
                          </span>
                          Gói ưu đãi
                        </a>
                      </li>
                    </ul>
                  </div>

                  {/* <!-- Menu 4 --> */}
                  <div className="profile-menu">
                    <h3 className="profile-menu__title">Hỗ trợ khách hàng</h3>
                    <ul className="profile-menu__list">
                      <li>
                        <a href="#!" className="profile-menu__link">
                          <span className="profile-menu__icon">
                            <img src={helpIcon} alt="" className="icon" />
                          </span>
                          Trợ giúp
                        </a>
                      </li>
                      <li>
                        <a href="#!" className="profile-menu__link">
                          <span className="profile-menu__icon">
                            <img src={dangerIcon} alt="" className="icon" />
                          </span>
                          Điều khoản sử dụng
                        </a>
                      </li>
                    </ul>
                  </div>
                </aside>
              </div>
              <div className="col-9 col-xl-8 col-lg-7 col-md-12">
                <Outlet context={{ userProfile, user }} />
                
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Profile;
