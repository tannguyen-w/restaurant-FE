import { useState, useEffect } from "react";
import imageDish from "../../assets/images/menu/menu-all-01.png";

import { getDishCategories } from "../../services/dishCategoryService";
import { getDishesByRestaurant } from "../../services/dishService";
import { Link } from "react-router-dom";

const MenuChoose = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);

  const baseImageUrl = "http://localhost:8081";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dishCateData, dishData] = await Promise.all([
          getDishCategories(),
          getDishesByRestaurant("68358036c25a7c884d0af047", { limit: 1000 }),
        ]);
        console.log("Dish Categories:", dishCateData);
        console.log("Dishes:", dishData);

        setCategories(dishCateData.results || []);
        setDishes(dishData.results || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const filteredDishes =
    activeCategory === "all" ? dishes : dishes.filter((dish) => dish.category?.id === activeCategory);

  const limitedDishes = filteredDishes.slice(0, 8);

  return (
    <div className="containerR">
      <div className="menu-offer menu-choose">
        <div className="menu__top">
          <p className="menu__desc">Thực đơn</p>
          <h2 className="menu__heading menu-offer__heading menu-choose__heading">Chọn và thưởng thức món bạn thích</h2>
          <p className="menu__desc menu-choose__desc">
            Danh sách những món ăn hàng đầu của Bangladesh bao gồm món chính, đồ uống và tráng miệng mà bạn nhất định
            phải thử khi đến Bangladesh để có trải nghiệm ẩm thực đích thực. Xem ngay!
          </p>
        </div>

        <div className="menu-offer__nav">
          <button
            className={`menu-offer__btn ${activeCategory === "all" ? "menu-offer__btn--active" : ""}`}
            onClick={() => setActiveCategory("all")}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`menu-offer__btn ${activeCategory === category.id ? "menu-offer__btn--active" : ""}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="menu-choose__separate"></div>

        <div className="menu-choose__list menu__list menu-offer__list d-block">
          <div className="row row-cols-2 g-3 g-lg-2 g-md-1 row-cols-md-1">
            {limitedDishes.length > 0 ? (
              limitedDishes.map((dish) => (
                <div className="col" key={dish.id}>
                  <Link to={`/dishes/${dish.id}`} className="menu-choose-item">
                    <div className="menu-choose-item__left">
                      <img
                        src={dish.images && dish.images.length > 0 ? `${baseImageUrl}${dish.images[0]}` : imageDish}
                        alt={dish.name}
                        className="menu-choose-item__thumb "
                      />
                      <h3 className="menu-choose-item__title">{dish.name}</h3>
                    </div>
                    <span className="menu-choose-item__price menu-item__price">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(dish.price)}
                    </span>
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-4">
                <p>Không có món ăn nào thuộc danh mục này</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuChoose;
