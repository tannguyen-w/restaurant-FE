import NavCustomer from "../../../components/NavCustomer";
import NavUser from "../../../components/NavUser";
import Footer from "../../../components/layouts/footer";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../components/context/authContext";
import { createReservation } from "../../../services/reservationService";
import { toast } from 'react-toastify';


import personalIcon from "../../../assets/icons/personal.svg";
import callIcon from "../../../assets/icons/call.svg";
import calendarIcon from "../../../assets/icons/calender.svg";
import timeIcon from "../../../assets/icons/time-circle.svg";
import arrowDownIcon from "../../../assets/icons/arrow-down.svg";
import emailIcon from "../../../assets/icons/message.svg";
import reservationBg from "../../../assets/images/order/order-01.png"

const Reservation = () => {

    const { user } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    phone: user?.phone || "",
    numberOfPeople: "1",
    date: "",
    time: ""
  });

  // Form errors state
  const [errors, setErrors] = useState({});
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }
    
    if (!formData.date) {
      newErrors.date = "Vui lòng chọn ngày";
    }
    
    if (!formData.time) {
      newErrors.time = "Vui lòng chọn giờ";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Format time slot (HH:MM to HHh format)
  const formatTimeSlot = (time) => {
    if (!time) return "";
    const hour = time.split(":")[0];
    const minute = time.split(":")[1];
    return `${hour}h:${minute}`;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Hiển thị thông báo lỗi chung nếu có lỗi
      toast.error("Vui lòng kiểm tra lại thông tin đặt bàn");
      return;
    }
    
    if (!user || !user.id) {
      toast.error("Vui lòng đăng nhập để đặt bàn");
      navigate("/login");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format reservation time to ISO string with seconds & milliseconds
      const reservationDate = new Date(`${formData.date}T${formData.time}`);
      const isoString = reservationDate.toISOString();
      
      // Format timeSlot as HHh
      const timeSlot = formatTimeSlot(formData.time);
      
      const requestData = {
        customer: user.id, // Gửi ID người dùng hiện tại
        phone: formData.phone,
        number_of_people: parseInt(formData.numberOfPeople),
        reservation_time: isoString,
        timeSlot: timeSlot
      };
      
      console.log("Sending reservation data:", requestData);
      
      // Call API to create reservation
      const response = await createReservation(requestData);
      
      // Show success message
      toast.success("Đặt bàn thành công! Nhà hàng sẽ liên hệ với bạn sớm.");
      
      // Reset form
      setFormData({
        phone: user?.phone || "",
        numberOfPeople: "1",
        date: "",
        time: ""
      });
      
    } catch (error) {
      console.error("Error creating reservation:", error);
      toast.error(error.response?.data?.message || "Đặt bàn không thành công. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get today's date for min attribute of date input
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate max date (e.g., 3 months from today)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateString = maxDate.toISOString().split('T')[0];
  

  

  return (
    <>
    {user ? <NavCustomer /> : <NavUser />}
      <div className="order-01" style={{ backgroundImage: `url(${reservationBg})` }}>
        <div className="containerR">
          <h2 className="order-01__heading">Đặt bàn trực tuyến</h2>
          <p className="order-01__desc">Đặt bàn cho bữa trưa hoặc bữa tối.</p>

          <form onSubmit={handleSubmit} className="order-01__form">
            <div className="row row-cols-3 g-3 row-cols-lg-2 row-cols-sm-1 g-sm-2">
              {/* <!-- Item 1 --> */}
              <div className="col">
                <div className="order-01__group">
                  <input
                    type="text"
                    placeholder={user ? "Tên của bạn" : "Đăng nhập để đặt bàn"}
                    className="order-01__input"
                    value={user?.full_name || ""}
                    readOnly
                    disabled
                  />
                  <img src={personalIcon} alt="" className="order-01__icon" />
                </div>
              </div>

              {/* <!-- Item 2 --> */}
              <div className="col">
                <div className={`order-01__group ${errors.phone ? "error" : ""}`}>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Số điện thoại"
                    className="order-01__input"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  <img src={callIcon} alt="" className="order-01__icon" />
                </div>
                {errors.phone && <p className="text-danger small mt-1">{errors.phone}</p>}
              </div>

              {/* <!-- Item 3 --> */}
              <div className="col">
                <div className="order-01__group">
                  <input
                    type="email"
                    placeholder={user ? "Email" : "Đăng nhập để đặt bàn"}
                    className="order-01__input"
                    value={user?.email || ""}
                    readOnly
                    disabled
                  />
                  <img src={emailIcon} alt="" className="order-01__icon" />
                </div>
              </div>

              {/* <!-- Item 4 --> */}
              <div className="col">
                <div className={`order-01__group ${errors.numberOfPeople ? "error" : ""}`}>
                  <select
                    name="numberOfPeople"
                    value={formData.numberOfPeople}
                    onChange={handleChange}
                    className="order-01__input order-01__select"
                  >
                    <option value="1">1 Người</option>
                    <option value="2">2 Người</option>
                    <option value="4">3-4 Người</option>
                    <option value="6">4-6 Người</option>
                    <option value="8">6-10 Người</option>
                    <option value="10">10-20 Người</option>
                    <option value="20">20+ Người</option>
                  </select>
                  <img src={arrowDownIcon} alt="" className="order-01__icon" />
                </div>
                {errors.numberOfPeople && <p className="text-danger small mt-1">{errors.numberOfPeople}</p>}
              </div>

              {/* <!-- Item 5 --> */}
              <div className="col">
                <div className={`order-01__group ${errors.date ? "error" : ""}`}>
                  <input
                    type="date"
                    name="date"
                    className="order-01__input"
                    id="date-input"
                    value={formData.date}
                    onChange={handleChange}
                    min={today}
                    max={maxDateString}
                  />
                  <img
                    src={calendarIcon}
                    alt=""
                    className="order-01__icon"
                    id="date-icon"
                  />
                </div>
                {errors.date && <p className="text-danger small mt-1">{errors.date}</p>}
              </div>

              {/* <!-- Item 6 --> */}
              <div className="col">
                <div className={`order-01__group ${errors.time ? "error" : ""}`}>
                  <input
                    type="time"
                    name="time"
                    className="order-01__input"
                    id="time-input"
                    value={formData.time}
                    onChange={handleChange}
                    min="10:00" 
                    max="22:00"
                  />
                  <img
                    src={timeIcon}
                    alt=""
                    className="order-01__icon"
                    id="time-icon"
                  />
                </div>
                {errors.time && <p className="text-danger small mt-1">{errors.time}</p>}
              </div>
            </div>

            <div className="order-01__act">
              {user.role.name === "customer" ? (
                // Người dùng đã đăng nhập - cho phép đặt bàn
                <button 
                  type="submit" 
                  className="order-01__btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang xử lý..." : "Đặt bàn ngay"}
                </button>
              ) : (
                // Người dùng chưa đăng nhập - chuyển hướng đến trang login
                <button 
                  type="button" // Đổi thành button type="button" để không submit form
                  className="order-01__btn"
                  onClick={() => navigate('/login', { state: { from: "/reservation" } })}
                >
                  Đăng nhập để đặt bàn
                </button>
              )}
            </div>
          </form>

       
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Reservation;
