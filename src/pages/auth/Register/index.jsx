import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { getAllUsers } from "../../../services/userSevices";
import { registerUser } from "../../../services/authService";

import introArrow from "../../../assets/images/auth/intro-arrow.svg";
import introImage from "../../../assets/images/auth/intro.svg";
import logoIcon from "../../../assets/icons/logo.svg";
import messageIcon from "../../../assets/icons/message.svg";
import formErrorIcon from "../../../assets/icons/form-error.svg";
import lockIcon from "../../../assets/icons/lock.svg";
import googleIcon from "../../../assets/icons/google.svg";

const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lấy danh sách users từ API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        if (response && response.results) {
          setUsers(response.results);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Kiểm tra username khi người dùng nhập
  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);

    // Kiểm tra username có trùng không
    const isDuplicate = users.some((user) => user.username === value);
    if (isDuplicate) {
      setErrors((prev) => ({ ...prev, username: "Tên đăng nhập đã tồn tại" }));
    } else {
      setErrors((prev) => ({ ...prev, username: "" }));
    }
  };

  // Kiểm tra mật khẩu xác nhận khi người dùng nhập
  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (value !== password) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Mật khẩu xác nhận không khớp",
      }));
    } else {
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }
  };

  // Xử lý đăng ký
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra lỗi
    let hasError = false;
    const newErrors = { ...errors };

    // Kiểm tra username
    const isDuplicate = users.some((user) => user.username === username);
    if (isDuplicate) {
      newErrors.username = "Tên đăng nhập đã tồn tại";
      hasError = true;
    }

    // Kiểm tra password
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      hasError = true;
    }

    setErrors(newErrors);

    if (!hasError) {
      setIsSubmitting(true);
      try {
        // Chỉ gửi username và password
        const result = await registerUser({ username, password });
        if (result) {
          // Đăng ký thành công, chuyển hướng đến trang đăng nhập
          alert("Đăng ký thành công! Vui lòng đăng nhập.");
          navigate("/login"); // Sử dụng navigate thay vì Navigate
        }
      } catch (error) {
        console.error("Registration error:", error);
        alert("Đăng ký không thành công. Vui lòng thử lại!");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <>
      <main className="auth">
        {/* <!-- Auth intro --> */}
        <div className="auth__intro">
          {/* <!-- Logo --> */}
          <Link to={"/"} className="auth__intro-logo logo d-none d-md-flex">
            <img
              src={logoIcon}
              alt="Nhà hàng Vạn Hoa"
              className="icon logo__img"
            />
            <h1 className="logo__title">Nhà hàng Vạn Hoa</h1>
          </Link>

          <img src={introImage} alt="" className="auth__intro-img" />
          <p className="auth__intro--text">
            The best of luxury brand values, high quality products, and
            innovative services
          </p>

          <button className="auth__intro-next d-none d-md-flex ">
            <img src={introArrow} alt="arrow" />
          </button>
        </div>

        {/* <!-- Auth content --> */}
        <div id="auth__content" className="auth__content hide">
          <div className="auth__content-inner">
            {/* <!-- Logo --> */}
            <Link to={"/"} className="auth__content-logo logo">
              <img
                src={logoIcon}
                alt="Nhà hàng Vạn Hoa"
                className="icon logo__img"
              />
              <h2 className="auth__title--heading logo__title">Vạn Hoa</h2>
            </Link>
            <h1 className="auth__heading">Đăng ký</h1>
            <p className="auth__desc">
              Hãy tạo tài khoản để mua sắm như chuyên gia và tiết kiệm chi phí.
            </p>
            <form onSubmit={handleSubmit} className="form auth__form">
              <div className="form__group">
                <div className="form__text-input">
                  <input
                    type="text"
                    placeholder="Tên tài khoản"
                    className="form__input"
                    value={username}
                    onChange={handleUsernameChange}
                    required
                    autoFocus
                  />
                  <img src={messageIcon} alt="" className="form__input-icon" />
                  {errors.username && (
                    <img
                      src={formErrorIcon}
                      alt=""
                      className="form__input-icon-error"
                    />
                  )}
                </div>
                {errors.username && (
                  <p className="form__error">{errors.username} đã tồn tại</p>
                )}
              </div>

              <div className="form__group">
                <div
                  className={`form__text-input ${
                    errors.password ? "form__text-input--error" : ""
                  }`}
                >
                  <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    className="form__input"
                    required
                  />
                  <img src={lockIcon} alt="" className="form__input-icon" />
                  {errors.password && (
                    <img
                      src={formErrorIcon}
                      alt=""
                      className="form__input-icon-error"
                    />
                  )}
                </div>
                {errors.password && (
                  <p className="form__error">{errors.password}</p>
                )}
              </div>

              <div className="form__group">
                <div
                  className={`form__text-input ${
                    errors.confirmPassword ? "form__text-input--error" : ""
                  }`}
                >
                  <input
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className="form__input"
                    required
                    minLength={6}
                  />
                  <img src={lockIcon} alt="" className="form__input-icon" />
                  <img
                    src={formErrorIcon}
                    alt=""
                    className="form__input-icon-error"
                  />
                </div>
              </div>

              <div className="form__group form__group--inline">
                <label className="form__checkbox">
                  <input
                    type="checkbox"
                    name=""
                    id=""
                    className="checkbox__input d-none"
                  />
                  <span className="form__checkbox-label">
                    Đặt làm mặc định{" "}
                  </span>
                </label>

                <Link
                  to={"/reset-password"}
                  className="auth__link form__pull-right"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <div className="form__group auth__btn-group">
                <button
                  type="submit"
                  className="btn auth__btn form__submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
                </button>
                <button className="btn auth__btn">
                  <img src={googleIcon} alt="google" />
                  Đăng ký bằng Google
                </button>
              </div>
            </form>

            <p className="auth__text">
              Bạn đã có tài khoản?
              <Link to={"/login"} className="auth__link auth__text-link">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
};

export default Register;
