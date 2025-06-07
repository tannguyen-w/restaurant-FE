import foodRestaurantMain from "../../assets/images/foods/food-restaurant-main.png";
import foodRestaurantTop from "../../assets/images/foods/food-restaurant-top.png";
import foodRestaurantMid from "../../assets/images/foods/food-restaurant-mid.png";
import foodRestaurantBottom from "../../assets/images/foods/food-restaurant-bottom.png";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <>
      <div className="containerR">
        <div className="header__content">
          <div className="row">
            <div className="col col-7 col-xl-6 col-md-12">
              <div className="header__left">
                <p className="header__desc">Chào, bạn mới</p>
                <h2 className="header__heading">
                  Tạo cảm xúc, không chỉ món ăn!
                </h2>
                <p className="header__desc--bottom">
                  Nấu ăn như một hoạt động sáng tạo giúp tăng cường sức khỏe và
                  tinh thần.
                </p>
                {/* Meunu */}
                <Link
                  to={"/menu"}
                  className="header__btn-underline btn btn--text btn--text-link"
                >
                  Our menu
                </Link>
              </div>
            </div>
            <div className="col col-5 col-xl-6 col-md-12">
              <div className="header__right">
                <img
                  src={foodRestaurantMain}
                  alt="Food main"
                  className="header__food-main rotate-img-left"
                />
                <span className="header__food-main--price">Giá: 199.000₫</span>
                <img
                  src={foodRestaurantTop}
                  alt="Food 2"
                  className="header__food-sub header__food-sub--top rotate-img-right"
                />
                <img
                  src={foodRestaurantMid}
                  alt="Food 3"
                  className="header__food-sub header__food-sub--mid rotate-img-right"
                />
                <img
                  src={foodRestaurantBottom}
                  alt="Food 4"
                  className="header__food-sub header__food-sub--bottom rotate-img-right"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Header;
