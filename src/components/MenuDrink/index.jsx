import { Link } from "react-router-dom";
import { getDishes } from "../../services/dishService";
import { useEffect, useState } from "react";

// Import Swiper và modules cần thiết
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import menuIcon from "../../assets/icons/menu-icon.svg";
import placeholderImg from "../../assets/images/menu/menu-breakfast-01.png";

const MenuDrink = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseImageUrl = "http://localhost:8081";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const dishData = await getDishes();
        setDishes(dishData.results || []);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Không thể tải dữ liệu món ăn. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const drinkDish = dishes.filter(
    (dish) => dish.category === "683580d2baec28398bc6a906"
  );
  console.log("drinkDish", drinkDish);

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };
  return (
    <>
      <div className="containerR">
        <div className="menu">
          <div className="menu__top">
            <h2 className="menu__heading">Đồ uống</h2>
            <img src={menuIcon} alt="" className="menu__icon" />
          </div>

          <div className="menu__list">

            {loading ? (
              <div className="text-center py-5">Đang tải món ăn...</div>
            ) : error ? (
              <div className="text-center py-5 text-danger">{error}</div>
            ) : drinkDish.length > 0 ? (
              <div className="swiper-container">
                <Swiper
                  modules={[Navigation, Pagination]}
                  spaceBetween={20}
                  slidesPerView={3}
                  navigation={{
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                  }}
                  breakpoints={{
                    320: {
                      slidesPerView: 1,
                      spaceBetween: 10,
                    },
                    768: {
                      slidesPerView: 2,
                      spaceBetween: 15,
                    },
                    1024: {
                      slidesPerView: 3,
                      spaceBetween: 20,
                    },
                  }}
                  className="mySwiper"
                >
                  {drinkDish.map((dish) => (
                    <SwiperSlide key={dish.id}>
                      <div className="menu-item">
                        <Link
                          to={`/dishes/${dish.id}`}
                          className="menu-item__link-detail"
                        >
                          <img
                            src={
                              dish.images && dish.images.length > 0
                                ? `${baseImageUrl}${dish.images[0]}`
                                : placeholderImg
                            }
                            alt={dish.name}
                            className="menu-item__thumb"
                            onError={(e) => {
                              e.target.src = placeholderImg;
                            }}
                          />
                          <h3 className="menu-item__title">{dish.name}</h3>
                          <p className="menu-item__desc">
                            {dish.description || "Không có mô tả cho món ăn này."}
                          </p>
                        </Link>
                        <div className="menu-item__separate d-md-none"></div>

                        <div className="menu-item__act">
                          <Link
                            to={`/product-detail/${dish.id}`}
                            className="menu-item__link"
                          >
                            Đặt ngay
                          </Link>
                          <span className="menu-item__price">
                            {formatPrice(dish.price)}
                          </span>
                        </div>
                        <div className="menu-item__separate d-none d-md-block"></div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
                {/* Custom Navigation Buttons */}
                <div className="swiper-button-prev"></div>
                <div className="swiper-button-next"></div>
              </div>
            ) : (
              <div className="text-center py-5">Không có món chính nào.</div>
            )}
         
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuDrink;
