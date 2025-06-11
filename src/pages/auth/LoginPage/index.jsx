import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../../components/context/authContext";
import { message, Button } from "antd";

import { login } from "../../../services/authService";
import { getInfo } from "../../../services/userServices";

import logo from "../../../assets/icons/logo.svg";
import intro from "../../../assets/images/auth/intro.svg";
import messageIcon from "../../../assets/icons/message.svg";
import fromError from "../../../assets/icons/form-error.svg";
import lock from "../../../assets/icons/lock.svg";
import googleBrand from "../../../assets/icons/google.svg";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login(username, password);

      if (response && response.user) {
        // Lưu thông tin người dùng vào context
        const userData = await getInfo();
        setUser(userData);

        // Lưu thông tin cần thiết vào localStorage
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("role", response.user.role.name);

        message.success("Đăng nhập thành công!");

        // Điều hướng theo role
        switch (response.user.role.name) {
          case "admin":
            navigate("/admin");
            break;
          case "staff":
            navigate("/staff");
            break;
          case "customer":
            navigate("/");
            break;
          default:
            navigate("/");
        }
      } else {
        message.error("Đăng nhập thất bại!");
      }
    } catch (error) {
      console.error("Login error:", error);
      message.error(error.response?.data?.message || "Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth">
        {/* <!-- Auth intro --> */}
        <div className="auth__intro d-md-none">
          <img src={intro} alt="" className="auth__intro-img" />
          <p className="auth__intro--text">
            The best of luxury brand values, high quality products, and innovative services
          </p>
        </div>

        {/* <!-- Auth content --> */}
        <div className="auth__content">
          <div className="auth__content-inner">
            {/* <!-- Logo --> */}
            <Link to={"/"} className="auth__content-logo logo">
              <img src={logo} alt="Nhà hàng Vạn Hoa" className="icon logo__img" />
              <h2 className="auth__title--heading logo__title">Nhà hàng Vạn Hoa</h2>
            </Link>
            <h1 className="auth__heading">Chào mừng trở lại</h1>
            <p className="auth__desc">
              Chào mừng bạn quay lại để đăng nhập. Là khách hàng quay lại, bạn có quyền truy cập vào tất cả thông tin đã
              lưu trước đó của mình.
            </p>
            <form onSubmit={handleSubmit} className="form auth__form">
              <div className="form__group">
                <div className="form__text-input">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập tên tài khoản"
                    className="form__input"
                    required
                    autoFocus
                  />
                  <img src={messageIcon} alt="" className="form__input-icon" />
                  <img src={fromError} alt="" className="form__input-icon-error" />
                </div>
                <p className="form__error">Tên tài khoản sai</p>
              </div>

              <div className="form__group">
                <div className="form__text-input">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    minLength={6}
                    className="form__input"
                    required
                  />
                  <img src={lock} alt="" className="form__input-icon" />
                  <img src={fromError} alt="" className="form__input-icon-error" />
                </div>
              </div>

              <div className="form__group form__group--inline">
                <label className="form__checkbox">
                  <input type="checkbox" name="" id="" className="checkbox__input d-none" />
                  <span className="form__checkbox-label">Đặt làm mặc định</span>
                </label>
              </div>

              <div className="form__group auth__btn-group">
                <Button loading={loading} type="primary" htmlType="submit" className="btn auth__btn form__submit-btn">
                  {loading ? "Đang xử lý..." : "Đăng nhập"}
                </Button>
                <button className="btn auth__btn">
                  <img src={googleBrand} alt="" />
                  Đăng nhập bằng Google
                </button>
              </div>
            </form>

            <p className="auth__text">
              Chưa có tài khoản?
              <Link to={"/register"} className="auth__link auth__text-link">
                Đăng ký
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
