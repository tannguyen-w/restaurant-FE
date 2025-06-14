import NavCustomer from "../../../components/NavCustomer";
import NavUser from "../../../components/NavUser";
import Footer from "../../../components/layouts/footer";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../components/context/authContext";
import { createReservation } from "../../../services/reservationService";
import { getRestaurants } from "../../../services/restaurantServices";
import { getTablesByRestaurant } from "../../../services/tableService";
import { checkTableReservation } from "../../../services/reservationService";

import callIcon from "../../../assets/icons/call.svg";
import calendarIcon from "../../../assets/icons/calender.svg";
import timeIcon from "../../../assets/icons/time-circle.svg";
import arrowDownIcon from "../../../assets/icons/arrow-down.svg";
import reservationBg from "../../../assets/images/order/order-01.png";
import { message } from "antd";

const Reservation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Thêm state cho nhà hàng và bàn
  const [restaurants, setRestaurants] = useState([]);
  const [tables, setTables] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);

  // Xác định navigation component an toàn
  const renderNavigation = () => {
    if (!user) return <NavUser />;

    if (user.role.name === "customer") {
      return <NavCustomer />;
    } else {
      return <NavUser />;
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    phone: user?.phone || "",
    restaurant: "",
    table: "",
    numberOfPeople: "1",
    date: "",
    time: "",
  });

  // Fetch danh sách nhà hàng khi mở form
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await getRestaurants();
        setRestaurants(res.results || []);
      } catch {
        setRestaurants([]);
      }
    };
    fetchRestaurants();
  }, []);

  // Fetch danh sách bàn khi chọn nhà hàng
  useEffect(() => {
    if (!formData.restaurant) {
      setTables([]);
      setAvailableTables([]);
      setFormData((prev) => ({ ...prev, table: "" }));
      return;
    }
    const fetchTables = async () => {
      try {
        const res = await getTablesByRestaurant(formData.restaurant);
        setTables(res || []);
        // Lọc bàn available
        setAvailableTables((res || []).filter((t) => t.status === "available"));
      } catch {
        setTables([]);
        setAvailableTables([]);
      }
    };
    fetchTables();
  }, [formData.restaurant]);

  // Form errors state
  const [errors, setErrors] = useState({});

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (name === "restaurant") {
      setFormData((prev) => ({ ...prev, table: "" }));
    }
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
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
    if (!formData.restaurant) {
      newErrors.restaurant = "Vui lòng chọn nhà hàng";
    }
    if (!formData.table) {
      newErrors.table = "Vui lòng chọn bàn";
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Hiển thị thông báo lỗi chung nếu có lỗi
      message.error("Vui lòng kiểm tra lại thông tin đặt bàn");
      return;
    }

    if (!user || !user.id) {
      message.error("Vui lòng đăng nhập để đặt bàn");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      // Kiểm tra bàn đã có người đặt chưa
      const isReserved = await checkTableReservation({
        tableId: formData.table,
        date: formData.date,
        time: formData.time,
      });
      if (!isReserved.success && !isReserved.available) {
        message.warning("Bàn này đã có người đặt vào thời gian này. Vui lòng chọn bàn hoặc thời gian khác.");
        setIsSubmitting(false);
        return;
      }

      // Format reservation time to ISO string with seconds & milliseconds
      const reservationDate = new Date(`${formData.date}T${formData.time}`);
      const isoString = reservationDate.toISOString();

      // Format timeSlot as HHh

      const requestData = {
        customer: user.id, // Gửi ID người dùng hiện tại
        phone: formData.phone,
        restaurant: formData.restaurant,
        table: formData.table,
        number_of_people: parseInt(formData.numberOfPeople),
        reservation_time: isoString,
        timeSlot: formData.time,
      };

      // Call API to create reservation
      await createReservation(requestData);

      // Show success message
      message.success("Đặt bàn thành công! Nhà hàng sẽ liên hệ với bạn sớm.");

      // Reset form
      setFormData({
        phone: user?.phone || "",
        restaurant: "",
        table: "",
        numberOfPeople: "1",
        date: "",
        time: "",
      });

      navigate("/profile/tables")
    } catch (error) {
      message.error(error.response?.data?.message || "Đặt bàn không thành công. Vui lòng thử lại sau.");
      console.error("Error creating reservation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get today's date for min attribute of date input
  const today = new Date().toISOString().split("T")[0];

  // Calculate max date (e.g., 3 months from today)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateString = maxDate.toISOString().split("T")[0];

  return (
    <>
      {renderNavigation()}
      <div className="order-01" style={{ backgroundImage: `url(${reservationBg})` }}>
        <div className="containerR">
          <h2 className="order-01__heading">Đặt bàn trực tuyến</h2>
          <p className="order-01__desc">Đặt bàn cho bữa trưa hoặc bữa tối.</p>

          <form onSubmit={handleSubmit} className="order-01__form">
            <div className="row row-cols-3 g-3 row-cols-lg-2 row-cols-sm-1 g-sm-2">
              {/* <!-- Item 1 --> */}
              <div className="col">
                <div className={`order-01__group ${errors.restaurant ? "error" : ""}`}>
                  <select
                    name="restaurant"
                    className="order-01__input order-01__select"
                    value={formData.restaurant}
                    onChange={handleChange}
                  >
                    <option value="">Chọn nhà hàng</option>
                    {restaurants.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <img src={arrowDownIcon} alt="" className="order-01__icon" />
                </div>
                {errors.restaurant && <p className="text-danger small mt-1">{errors.restaurant}</p>}
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
                <div className={`order-01__group ${errors.table ? "error" : ""}`}>
                  <select
                    name="table"
                    className="order-01__input order-01__select"
                    value={formData.table}
                    onChange={handleChange}
                    disabled={!formData.restaurant}
                  >
                    <option value="">Chọn bàn</option>
                    {availableTables.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.capacity} người)
                      </option>
                    ))}
                  </select>
                  <img src={arrowDownIcon} alt="" className="order-01__icon" />
                </div>
                {errors.table && <p className="text-danger small mt-1">{errors.table}</p>}
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
                  <img src={calendarIcon} alt="" className="order-01__icon" id="date-icon" />
                </div>
                {errors.date && <p className="text-danger small mt-1">{errors.date}</p>}
              </div>

              {/* <!-- Item 6 --> */}
              <div className="col">
                <div className={`order-01__group ${errors.time ? "error" : ""}`}>
                  <select
                    name="time"
                    className="order-01__input order-01__select"
                    id="time-input"
                    value={formData.time}
                    onChange={handleChange}
                  >
                    <option value="">Chọn giờ</option>
                    <option value="10:00">10h</option>
                    <option value="11:00">11h</option>
                    <option value="12:00">12h</option>
                    <option value="13:00">13h</option>
                    <option value="14:00">14h</option>
                    <option value="15:00">15h</option>
                    <option value="16:00">16h</option>
                    <option value="17:00">17h</option>
                    <option value="18:00">18h</option>
                    <option value="19:00">19h</option>
                    <option value="20:00">20h</option>
                  </select>
                  <img src={timeIcon} alt="" className="order-01__icon" id="time-icon" />
                </div>
                {errors.time && <p className="text-danger small mt-1">{errors.time}</p>}
              </div>
            </div>

            <div className="order-01__act">
              {user.role.name === "customer" ? (
                // Người dùng đã đăng nhập - cho phép đặt bàn
                <button type="submit" className="order-01__btn" disabled={isSubmitting}>
                  {isSubmitting ? "Đang xử lý..." : "Đặt bàn ngay"}
                </button>
              ) : (
                // Người dùng chưa đăng nhập - chuyển hướng đến trang login
                <button
                  type="button" // Đổi thành button type="button" để không submit form
                  className="order-01__btn"
                  onClick={() => navigate("/login", { state: { from: "/reservation" } })}
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
