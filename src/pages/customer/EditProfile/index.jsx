import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../components/context/authContext";
import { updateUserProfile } from "../../../services/userServices";

import arrowLeft from "../../../assets/icons/arrow-left.svg";
import formErrorIcon from "../../../assets/icons/form-error.svg";
import avatarImage from "../../../assets/images/avatar/avatar-01.png";
import { message } from "antd";

const EditProfile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  // Initialize form state with user data
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    avatar: "",
  });

  // State for form validation
  const [errors, setErrors] = useState({
    full_name: "",
    email: "",
    phone: "",
    avatar: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        avatar: null,
      });

      if (user.avatar) {
        setAvatarPreview(`http://localhost:8081${user.avatar}`);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Validate dữ liệu ngay khi người dùng nhập
    let errorMessage = "";

    switch (name) {
      case "full_name":
        if (!value.trim()) {
          errorMessage = "Họ và tên không được để trống";
        }
        break;

      case "email":
        if (value) {
          const emailRegex = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim;

          if (!emailRegex.test(value)) {
            errorMessage = "Email không đúng định dạng";
          }
        }
        break;

      case "phone":
        if (value) {
          const phoneRegex = /^[0-9]{10}$/;
          if (!phoneRegex.test(value)) {
            errorMessage = "Số điện thoại cần 10 chữ số";
          }
        }
        break;

      default:
        break;
    }

    // Luôn cập nhật trạng thái lỗi, bất kể có lỗi trước đó hay không
    setErrors({
      ...errors,
      [name]: errorMessage,
    });
  };

  // Xử lý khi người dùng chọn file avatar
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Kiểm tra định dạng file
      if (!file.type.includes("image")) {
        setErrors({
          ...errors,
          avatar: "Vui lòng chọn file hình ảnh",
        });
        return;
      }

      // Kiểm tra kích thước file (giới hạn 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({
          ...errors,
          avatar: "Kích thước file không được vượt quá 5MB",
        });
        return;
      }

      // Cập nhật state và hiển thị preview
      setFormData({
        ...formData,
        avatar: file,
      });

      // Tạo URL để preview ảnh
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Xóa thông báo lỗi nếu có
      if (errors.avatar) {
        setErrors({
          ...errors,
          avatar: "",
        });
      }
    }
  };

  // Validate form
  const validateForm = () => {
    // Sử dụng errors hiện tại để kiểm tra xem có lỗi nào không
    let hasErrors = false;
    const newErrors = { ...errors };

    // Kiểm tra lại các trường bắt buộc
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Họ và tên không được để trống";
      hasErrors = true;
    }

    if (formData.email) {
      const emailRegex = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim;

      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Email không đúng định dạng";
        hasErrors = true;
      }
    }

    if (formData.phone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = "Số điện thoại cần 10 chữ số";
        hasErrors = true;
      }
    }

    // Cập nhật state errors
    setErrors(newErrors);

    // Trả về true nếu không có lỗi
    return !hasErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Kiểm tra có thay đổi gì không
      const isChanged =
        formData.full_name !== user.full_name ||
        formData.email !== user.email ||
        formData.phone !== user.phone ||
        !!formData.avatar;

      if (!isChanged) {
        message.info("Bạn chưa thay đổi thông tin nào.");
        return;
      }

      setIsSubmitting(true);

      try {
        // Tạo FormData object để gửi dữ liệu bao gồm file
        const formDataToSend = new FormData();

        if (formData.full_name && formData.full_name !== user.full_name)
          formDataToSend.append("full_name", formData.full_name);
        if (formData.email && formData.email !== user.email) formDataToSend.append("email", formData.email);
        if (formData.phone && formData.phone !== user.phone) formDataToSend.append("phone", formData.phone);
        if (formData.avatar) formDataToSend.append("avatar", formData.avatar);

        // Call API to update profile
        const result = await updateUserProfile(formDataToSend);

        if (result) {
          const newAvatar =
            result.avatar && result.avatar !== "/images/avatars/default.webp" ? result.avatar : user.avatar;
          // Update user context with new data

          setUser({
            ...user,
            full_name: formData.full_name || user.full_name,
            email: formData.email || user.email,
            phone: formData.phone || user.phone,
            avatar: newAvatar,
          });

          if (result.avatar && result.avatar !== "/images/avatars/default.webp") {
            setAvatarPreview(`http://localhost:8081${result.avatar}`);
          }

          // Save updated user to localStorage if necessary
          const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...storedUser,
              full_name: formData.full_name || storedUser.full_name,
              email: formData.email || storedUser.email,
              phone: formData.phone || storedUser.phone,
              avatar: newAvatar,
            })
          );

          message.success("Cập nhật thông tin thành công!");
          navigate("/profile");
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        message.error("Cập nhật thông tin không thành công. Vui lòng thử lại!");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div>
      <div className="cart-info">
        <div className="row gy-3">
          {/* <!-- Form edit --> */}
          <div className="col-12">
            <h2 className="cart-info__heading">
              <Link to={"/profile"}>
                <img src={arrowLeft} alt="" className="icon cart-info__back-arrow" />
              </Link>
              Thông tin cá nhân
            </h2>

            <form onSubmit={handleSubmit} className="form form-card">
              {/* Avatar preview & upload */}
              <div className="form__row justify-content-center mb-4">
                <div className="form__group text-center">
                  <div className="avatar-upload">
                    <img
                      src={avatarPreview || (user && user.avatar ? `http://localhost:8081${user.avatar}` : avatarImage)}
                      alt="Avatar"
                      className="avatar-preview"
                      style={{
                        width: "150px",
                        height: "150px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginBottom: "15px",
                      }}
                    />
                    <label htmlFor="avatar-input" className="btn btn--primary btn--sm">
                      Chọn ảnh đại diện
                    </label>
                    <input
                      type="file"
                      id="avatar-input"
                      name="avatar"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                    {errors.avatar && <p className="form__error mt-2">{errors.avatar}</p>}
                  </div>
                </div>
              </div>
              {/* <!-- Form row 1 --> */}
              <div className="form__row">
                <div className="form__group">
                  <label htmlFor="full-name" className="form__label form__label--medium">
                    Họ và tên
                  </label>
                  <div className={`form__text-input ${errors.full_name ? "form__text-input--error" : ""}`}>
                    <input
                      type="text"
                      name="full_name"
                      id="full-name"
                      placeholder="Nhập họ và tên"
                      className="form__input"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                      autoFocus
                    />
                    {errors.full_name && <img src={formErrorIcon} alt="Error" className="form__input-icon-error" />}
                  </div>
                  {errors.full_name && <p className="form__error">{errors.full_name}</p>}
                </div>

                <div className="form__group">
                  <label htmlFor="email-address" className="form__label form__label--medium">
                    Email
                  </label>
                  <div className={`form__text-input ${errors.email ? "form__text-input--error" : ""}`}>
                    <input
                      type="email"
                      name="email"
                      id="email-address"
                      placeholder="Nhập email"
                      className="form__input"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    {errors.email && <img src={formErrorIcon} alt="Error" className="form__input-icon-error" />}
                  </div>
                  {errors.email && <p className={`form__error ${errors.email ? "shown" : ""}`}>{errors.email}</p>}
                </div>
              </div>

              {/* <!-- Form row 2 --> */}
              <div className="form__row">
                <div className="form__group">
                  <label htmlFor="phone" className="form__label form__label--medium">
                    Số điện thoại
                  </label>
                  <div className={`form__text-input ${errors.phone ? "form__text-input--error" : ""}`}>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      placeholder="Nhập số điện thoại"
                      className="form__input"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                    {errors.phone && <img src={formErrorIcon} alt="Error" className="form__input-icon-error" />}
                  </div>
                  {errors.phone && <p className="form__error">{errors.phone}</p>}
                </div>

                <div className="form__group"></div>
              </div>

              <div className="form-card__bottom">
                <Link to="/profile" className="btn btn--text form-card__btn-text">
                  Huỷ
                </Link>
                <button
                  type="submit"
                  className="btn btn--primary btn--rounded form-card__btn-save"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
