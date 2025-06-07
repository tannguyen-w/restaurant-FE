import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../components/context/cartContext";
import { getDishes } from "../../services/dishService";
import { getOrderDetails } from "../../services/orderDetailService";

import starIcon from "../../assets/icons/star.svg";
import starEmptyIcon from "../../assets/icons/star-empty.svg";
import arrowRightIcon from "../../assets/icons/arrow-right.svg";
import defaultDishImage from "../../assets/images/menu/menu-all-01.png";
import { message } from "antd";

const MenuMostPopular = () => {
  const { addToCart } = useCart();
  const [dishes, setDishes] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [popularDishes, setPopularDishes] = useState([]);
  const imageRefs = useRef([]);

  const baseImageUrl = "http://localhost:8081";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderDetailData, dishData] = await Promise.all([
          getOrderDetails(),
          getDishes(),
        ]);

        setOrderDetails(orderDetailData.results || []);
        setDishes(dishData.results || []);

        calculatePopularDishes(
          orderDetailData.results || [],
          dishData.results || []
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (popularDishes.length > 0) {
      setTimeout(() => {
        let maxHeight = 0;
        imageRefs.current.forEach((img) => {
          if (img && img.offsetHeight > maxHeight) {
            maxHeight = img.offsetHeight;
          }
        });

        imageRefs.current.forEach((img) => {
          if (img) {
            img.style.height = `${maxHeight}px`;
          }
        });
      }, 300);
    }
  }, [popularDishes]);

  const calculatePopularDishes = (orderDetails, dishes) => {
    const dishQuantityMap = {};
    orderDetails.forEach((detail) => {
      const dishId = detail.dish;
      const quantity = detail.quantity || 0;

      if (dishQuantityMap[dishId]) {
        dishQuantityMap[dishId] += quantity;
      } else {
        dishQuantityMap[dishId] = quantity;
      }
    });

    const dishesWithQuantity = dishes.map((dish) => ({
      ...dish,
      soldQuantity: dishQuantityMap[dish._id] || 0,
    }));
    const sortedDishes = dishesWithQuantity.sort(
      (a, b) => b.soldQuantity - a.soldQuantity
    );

    const top3Dishes = sortedDishes.slice(0, 3);

    setPopularDishes(top3Dishes);
  };

  return (
    <div className="containerR">
      <div className="menu menu-most-popular">
        <div className="menu__top">
          <h2 className="menu__heading">Món ăn bán chạy nhất</h2>
          <p className="menu-most-popular__desc">
            Danh sách các món ăn được yêu thích nhất tại nhà hàng chúng tôi. Đây
            là những món đã được nhiều khách hàng lựa chọn và đánh giá cao.
          </p>
        </div>

        <div className="menu__list">
          <div className="row row-cols-3 row-cols-md-1">
            {popularDishes.length > 0 ? (
              popularDishes.map((dish, index) => (
                <div className="col" key={dish.id}>
                  <div className="menu-item">
                    <Link
                      to={`/dishes/${dish.id}`}
                      className="menu-item__link-detail"
                    >
                      <img
                        ref={(el) => (imageRefs.current[index] = el)}
                        src={
                          dish.images && dish.images.length > 0
                            ? (() => {
                                const imageUrl = `${baseImageUrl}${dish.images[0]}`;
                                return imageUrl;
                              })()
                            : defaultDishImage
                        }
                        alt={dish.name}
                        className="menu-item__thumb"
                      />
                      <div className="menu-most-popular-item__top">
                        <h3 className="menu-item__title menu-most-popular-item__title">
                          {dish.name}
                        </h3>
                        <span className="menu-item__price menu-most-popular-item__price">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(dish.price)}
                        </span>
                      </div>
                      <p className="menu-item__desc menu-most-popular-item__desc">
                        {dish.description || "Món ăn đặc trưng của nhà hàng"}
                      </p>
                    </Link>

                    <div className="menu-item__act menu-most-popular-item__act">
                      <button
                        className="menu-item__link"
                        onClick={() => {
                          // Tạo đối tượng dishData với đầy đủ thông tin cần lưu vào giỏ hàng
                          const dishData = {
                            id: dish._id,
                            name: dish.name,
                            price: dish.price,
                            description: dish.description,
                            // Đảm bảo lưu đường dẫn hình ảnh đầy đủ
                            image:
                              dish.images && dish.images.length > 0
                                ? `${baseImageUrl}${dish.images[0]}`
                                : defaultDishImage,
                          };

                          // Thêm vào giỏ hàng với đầy đủ thông tin
                          addToCart(dishData);
                          message.success(`Đã thêm ${dish.name} vào giỏ hàng!`);
                        }}
                      >
                        Đặt ngay
                      </button>

                      <div className="menu-most-popular-item__rating">
                        {/* Hiển thị 4 sao đầy và 1 sao rỗng (có thể thay bằng hệ thống đánh giá thực) */}
                        <img src={starIcon} alt="star" />
                        <img src={starIcon} alt="star" />
                        <img src={starIcon} alt="star" />
                        <img src={starIcon} alt="star" />
                        <img src={starEmptyIcon} alt="empty star" />
                      </div>
                    </div>
                    <div className="menu-item__separate d-none d-md-block"></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-4">
                <p>Chưa có dữ liệu món ăn phổ biến</p>
              </div>
            )}
          </div>
        </div>

        <div className="menu-most-popular__bottom">
          <Link to="/menu" className="menu-most-popular__link">
            Xem tất cả món ăn
            <img src={arrowRightIcon} alt="arrow right" />
          </Link>
        </div>
      </div>
    </div>
  );
};
export default MenuMostPopular;
