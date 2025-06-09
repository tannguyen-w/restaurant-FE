import { useState, useEffect } from "react";
import { getRestaurants } from "../../services/restaurantServices";
import { getDishes } from "../../services/dishService";

import countdownBg from "../../assets/images/foods/count-down.png";
import countdownBgMobile from "../../assets/images/foods/count-down-02.png";

const CountDown = () => {
  const countdownStyle = {
    background: `url(${countdownBg})`,
    backgroundOrigin: "content-box",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  };

  const isMobile = window.innerWidth < 576;

  const [restaurantCount, setRestaurantCount] = useState(0);
  const [dishCount, setDishCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restData, dishData] = await Promise.all([getRestaurants(), getDishes()]);

        setRestaurantCount(restData.totalResults || 0);
        setDishCount(dishData.totalResults || 0);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <div
        className="countdown"
        style={isMobile ? { ...countdownStyle, background: `url(${countdownBgMobile})` } : countdownStyle}
      >
        <div className="containerR">
          <div className="countdown__inner">
            <ul className="countdown__list">
              <li className="countdown__item">
                <span className="countdown__left">{restaurantCount}</span>
                <span className="countdown__right">Number Restaurant</span>
              </li>

              <li className="countdown__item">
                <span className="countdown__left">{dishCount}</span>
                <span className="countdown__right">New Food Menu Dishes</span>
              </li>

              <li className="countdown__item">
                <span className="countdown__left">36</span>
                <span className="countdown__right">Years of experience</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default CountDown;
