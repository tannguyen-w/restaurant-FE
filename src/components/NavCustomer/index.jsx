import { useCart } from "../../components/context/cartContext";
import { useAuth } from "../../components/context/authContext";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { logout } from "../../services/authService";

import { Button, message, Popconfirm } from "antd";

import moreIcon from "../../assets/icons/more.svg";
import logoIcon from "../../assets/icons/logo.svg";
import arrowLeft from "../../assets/icons/arrow-left.svg";
import buyIcon from "../../assets/icons/buy.svg";
import arrowUpIcon from "../../assets/icons/arrow-up.png";
import logoutIcon from "../../assets/icons/logout.svg";
import userIcon from "../../assets/icons/user.svg";
import favouriteIcon from "../../assets/icons/favourite.svg";
import settingIcon from "../../assets/icons/setting.svg";
import sunDarkIcon from "../../assets/icons/sun-dark.svg";

import minusIcon from "../../assets/icons/minus.svg";
import plusIcon from "../../assets/icons/plus.svg";

const NavCustomer = () => {
  const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCart();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  const baseUrl = "http://localhost:8081";

  // Xử lý khi người dùng xác nhận xóa sản phẩm
  const handleRemoveItem = (item) => {
    try {
      // Gọi hàm xóa sản phẩm từ context
      removeFromCart(item.id);

      // Hiển thị thông báo thành công với màu chữ đen trên nền trắng
      message.success({
        content: `Đã xóa ${item.name} khỏi giỏ hàng`,
        style: {
          color: "#000", // Đảm bảo chữ màu đen để dễ đọc
        },
      });

      // Cập nhật localStorage
      updateLocalStorage();
    } catch (error) {
      console.error("Error removing item:", error);
      message.error({
        content: "Có lỗi xảy ra khi xóa sản phẩm",
        style: { color: "#000" },
      });
    }
  };

  // Hủy xóa sản phẩm
  const cancelRemove = () => {
    message.info({
      content: "Đã hủy xóa sản phẩm",
      style: { color: "#000" },
    });
  };

  // Tăng số lượng sản phẩm
  const handleIncreaseQuantity = (item) => {
    try {
      // Cập nhật số lượng trong context
      updateQuantity(item.id, item.quantity + 1);

      // Cập nhật localStorage
      updateLocalStorage();
    } catch (error) {
      console.error("Error increasing quantity:", error);
      message.error({
        content: "Có lỗi xảy ra khi cập nhật số lượng",
        style: { color: "#000" },
      });
    }
  };

  // Giảm số lượng sản phẩm
  const handleDecreaseQuantity = (item) => {
    // Nếu số lượng là 1, không giảm thêm
    if (item.quantity <= 1) {
      message.info({
        content: "Số lượng tối thiểu là 1",
        style: { color: "#000" },
      });
      return;
    }

    try {
      // Cập nhật số lượng trong context
      updateQuantity(item.id, item.quantity - 1);

      // Cập nhật localStorage
      updateLocalStorage();
    } catch (error) {
      console.error("Error decreasing quantity:", error);
      message.error({
        content: "Có lỗi xảy ra khi cập nhật số lượng",
        style: { color: "#000" },
      });
    }
  };

  // Hàm cập nhật localStorage
  const updateLocalStorage = () => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  };

  // Cập nhật avatar khi user thay đổi
  useEffect(() => {
    if (user && user.avatar) {
      // Nếu avatar là đường dẫn đầy đủ (bắt đầu bằng http)
      if (user.avatar.startsWith("http")) {
        setAvatarUrl(user.avatar);
      } else {
        // Nếu là đường dẫn tương đối, thêm baseUrl
        setAvatarUrl(`${baseUrl}${user.avatar}`);
      }
    }
    // Không cần fallback vì avatar luôn có từ BE
  }, [user]);

  // Toggle functions
  const toggleMenu = () => setShowMenu(!showMenu);
  const toggleCartDropdown = () => {
    setShowCartDropdown(!showCartDropdown);
    if (showUserDropdown) setShowUserDropdown(false);
  };
  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
    if (showCartDropdown) setShowCartDropdown(false);
  };

  const handleLogout = async () => {
    try {
      await logout(); // Gọi API đăng xuất

      // Cập nhật trạng thái đăng nhập trong context
      setUser(null);

      // Xóa token và thông tin người dùng từ localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Đóng dropdown
      setShowUserDropdown(false);

      // Chuyển hướng về trang đăng nhập
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="containerR">
      <div className="navbar__content">
        {/* <!-- More --> */}
        <button className="top-bar__more d-none d-lg-block " onClick={toggleMenu}>
          <img src={moreIcon} alt="More" className="icon top-bar__more-icon" />
        </button>

        {/* <!-- Logo --> */}
        <Link to={"/"} className="logo">
          <img src={logoIcon} alt="Nhà hàng Vạn Hoa" className="icon logo__img" />
          <h1 className="logo__title">Vạn Hoa</h1>
        </Link>

        <div id="navbar__main" className={`navbar__main ${showMenu ? "" : "hide"}`}>
          <button className="navbar__close-btn " onClick={toggleMenu}>
            <img className="icon" src={arrowLeft} alt="Arrow left" />
          </button>

          <ul className="navbar__list">
            <li className="navbar__item">
              <NavLink to={"/home"} className="navbar__link">
                Home
              </NavLink>
            </li>
            <li className="navbar__item">
              <NavLink to={"/menu"} className="navbar__link">
                Menu
              </NavLink>
            </li>
            <li className="navbar__item">
              <NavLink to={"/about"} className="navbar__link">
                About
              </NavLink>
            </li>
            <li className="navbar__item">
              <NavLink to={"/reservation"} className="navbar__link">
                Reservation
              </NavLink>
            </li>
            <li className="navbar__item">
              <NavLink to={"/contact"} className="navbar__link">
                Contact
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Overlay */}
        {showMenu && <div className="navbar__overlay" onClick={toggleMenu}></div>}
        {/* <!-- Actions --> */}
        <div className="top-act">
          <div className="top-act__btn-wrap">
            <button className="top-act__cart" onClick={toggleCartDropdown}>
              <img src={buyIcon} alt="Buy" className="top-act__icon-buy top-act__icon icon" />
              <span className="top-act__quantity">{cartItems.length}</span>
            </button>

            {/* <!-- Dropdown --> */}
            {showCartDropdown && (
              <div className="act-dropdown top-act__dropdown">
                <div className="act-dropdown__inner act-dropdown-cart__inner">
                  <img src={arrowUpIcon} alt="" className="act-dropdown__arrow act-dropdown-cart__arrow" />
                  <div className="act-dropdown-cart__top">
                    <h4 className="act-dropdown__title act-dropdown-cart__title">{cartItems.length} sản phẩm</h4>
                    <Link to="/cart" className="act-dropdown-cart__link">
                      Xem tất cả
                    </Link>
                  </div>

                  <div className="act-dropdown__list">
                    {cartItems.map((item) => {
                      // Đặt console.log bên trong khối code nếu cần debug
                      // console.log(item);

                      return (
                        <article className="cart-preview-item" key={item.id}>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="cart-preview-item__img"
                            onError={(e) => {
                              // Fallback khi không load được ảnh
                              e.target.src = `${baseUrl}/images/default-dish.jpg`;
                            }}
                          />
                          <div className="cart-preview-item__content">
                            <h4 className="cart-preview-item__title">{item.name}</h4>
                            <div className="cart-preview-item__price">
                              <span className="cart-preview-item__quantity">{item.quantity} x </span>
                              <span className="cart-preview-item__unit-price">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(item.price)}
                              </span>
                            </div>
                            <div className="cart-preview-item__actions">
                              <div className="cart-preview-item__quantity-control">
                                <button
                                  className="cart-preview-item__quantity-btn"
                                  onClick={() => handleDecreaseQuantity(item)}
                                >
                                  <img className="icon" src={minusIcon} alt="Giảm số lượng" />
                                </button>
                                <button
                                  className="cart-preview-item__quantity-btn"
                                  onClick={() => handleIncreaseQuantity(item)}
                                >
                                  <img className="icon" src={plusIcon} alt="Tăng số lượng" />
                                </button>
                              </div>
                              <Popconfirm
                                title="Xác nhận xóa"
                                description="Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?"
                                onConfirm={() => handleRemoveItem(item)}
                                onCancel={cancelRemove}
                                okText="Xoá"
                                cancelText="Huỷ"
                              >
                                <Button className="cart-preview-item__delete">x</Button>
                              </Popconfirm>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  <div className="cart-sub user-menu__separate">
                    <div className="cart-sub__total">
                      <p className="cart-sub__title">Tổng cộng:</p>
                      <p className="cart-sub__price">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(cartTotal)}
                      </p>
                    </div>
                    <div className="cart-sub__act">
                      <Link to="/checkout" className="cart-sub__act--link cart-sub__payment">
                        Thanh toán
                      </Link>
                      <Link to="/cart" className="cart-sub__act--link cart-sub__detail">
                        Giỏ hàng
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="top-act__user">
            <div className="top-act__username" onClick={toggleUserDropdown}>
              <img src={avatarUrl} alt="Avatar" className="top-act__avatar" />
            </div>

            {/* <!-- Dropdown  --> */}
            {showUserDropdown && (
              <div className="act-dropdown top-act__dropdown">
                <div className="act-dropdown__inner user-menu">
                  <img src={arrowUpIcon} alt="" className="act-dropdown__arrow top-act__arrow" />

                  <div className="user-menu__top">
                    <img src={avatarUrl} alt="Avatar" className="user-menu__avatar" />
                    <div>
                      <p className="user-menu__name">{user && user.full_name ? user.full_name : "Người dùng"}</p>
                      <p>@{user ? user.username : "guest"}</p>
                    </div>
                  </div>

                  <ul className="user-menu__list">
                    <li>
                      <Link to="/profile" className="user-menu__link">
                        <img src={userIcon} alt="" className="icon user-menu__icon" />
                        Hồ sơ
                      </Link>
                    </li>
                    <li>
                      <Link to="/favorites" className="user-menu__link">
                        <img src={favouriteIcon} alt="" className="icon user-menu__icon" />
                        Yêu thích
                      </Link>
                    </li>
                    <li className="user-menu__separate">
                      <button className="user-menu__link" id="switch-theme-btn">
                        <img src={sunDarkIcon} alt="" className="icon user-menu__icon" />
                        <span>Chế độ tối</span>
                      </button>
                    </li>
                    <li className="user-menu__separate">
                      <Link to="/settings" className="user-menu__link">
                        <img src={settingIcon} alt="" className="icon user-menu__icon" />
                        Cài đặt
                      </Link>
                    </li>
                    <li>
                      <button onClick={handleLogout} className="user-menu__link">
                        <img src={logoutIcon} alt="" className="icon user-menu__icon" />
                        Đăng xuất
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default NavCustomer;
