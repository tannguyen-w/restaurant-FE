import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import offerBg from "../../assets/images/offers/offer-01.png";
import { getDishes } from "../../services/dishService";
import defaultDishImage from "../../assets/images/offers/offer-item-01.png";

const Offer = () => {
  const [dishes, setDishes] = useState([]);
  const baseImageUrl = "http://localhost:8081";
  const imageRefs = useRef([]);

  const offerStyle = {
    background: `url(${offerBg})`,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dishData = await getDishes();
        // Sắp xếp món ăn theo giá cao → thấp
        const sortedDishes = [...(dishData.results || [])].sort(
          (a, b) => b.price - a.price
        );

        // Lấy 3 món có giá cao nhất
        const topThreeDishes = sortedDishes.slice(0, 3);

        setDishes(topThreeDishes);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Xử lý chiều cao ảnh - chạy sau khi dishes được cập nhật
  useEffect(() => {
    if (dishes.length > 0) {
      setTimeout(() => {
        // Tìm chiều cao lớn nhất
        let maxHeight = 0;
        imageRefs.current.forEach((img) => {
          if (img && img.offsetHeight > maxHeight) {
            maxHeight = img.offsetHeight;
          }
        });

        // Áp dụng chiều cao cho tất cả hình ảnh
        imageRefs.current.forEach((img) => {
          if (img) {
            img.style.height = `${maxHeight}px`;
          }
        });
      }, 300);
    }
  }, [dishes]);

  return (
    <div className="containerR">
      <div className="offer">
        <h2 className="offer__heading">Khuyến mãi hôm nay</h2>
        <div className="row">
          <div className="col col-6 col-md-12">
            <div className="offer__left" style={offerStyle}>
              <div className="offer__border">
                <div className="offer__title">Bữa trưa</div>
                <div className="offer__discount">
                  <span className="offer__discount-number">30%</span>
                  <span className="offer__discount-text">off</span>
                </div>
                <p className="offer__desc">
                  Chúng tôi yêu ẩm thực, đủ món ngon đa dạng, giống như bạn vậy.
                </p>

                <Link to="/menu" className="offer__btn btn btn--primary">
                  Đặt ngay
                </Link>
              </div>
            </div>
          </div>
          <div className="col col-6 col-md-12">
            <div className="offer__list">
              {dishes.length > 0 ? (
                dishes.map((dish, index) => (
                  <div className="offer-item" key={dish.id}>
                    <img
                      ref={(el) => (imageRefs.current[index] = el)}
                      src={
                        dish.images && dish.images.length > 0
                          ? `${baseImageUrl}${dish.images[0]}`
                          : defaultDishImage
                      }
                      alt={dish.name}
                      className="offer-item__thumb"
                    />
                    <div className="offer-item__content">
                      <div className="offer-item__left">
                        <h3 className="offer-item__title">{dish.name}</h3>
                        <p className="offer-item__desc">
                          {dish.description ||
                            "Món ăn đặc trưng của nhà hàng Vạn Hoa"}
                        </p>
                      </div>
                      <span className="offer-item__price">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(dish.price)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="offer-item">
                  <p className="offer-item__desc">
                    Không có món ăn nào được khuyến mãi hôm nay.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offer;
