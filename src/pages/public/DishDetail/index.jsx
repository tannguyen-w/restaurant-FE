import { useEffect, useState } from "react";
import { useCart } from "../../../components/context/cartContext";
import { useParams } from "react-router-dom";

import { getDishById } from "../../../services/dishService";

import Footer from "../../../components/layouts/footer";

import starIcon from "../../../assets/icons/star.svg";
import minusIcon from "../../../assets/icons/minus.svg";
import plusIcon from "../../../assets/icons/plus.svg";
import dishImageDefault from "../../../assets/images/product/product-detail.png";
import { useAuth } from "../../../components/context/authContext";
import NavCustomer from "../../../components/NavCustomer";
import NavUser from "../../../components/NavUser";
import { message } from "antd";

const DishDetail = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [dish, setDish] = useState({});
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);

  // Tăng số lượng
  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  // Giảm số lượng nhưng không nhỏ hơn 1
  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  // Thêm vào giỏ hàng với số lượng chọn
  const handleAddToCart = () => {
    const dishWithQuantity = { ...dish, quantity };
    addToCart(dishWithQuantity);
    message.success(`Đã thêm ${dish.name} vào giỏ hàng với số lượng ${quantity}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Truyền id vào hàm getDishById
        const dishData = await getDishById(id);
        console.log("Dish data:", dishData);
        setDish(dishData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id]);

  const imageUrl =
    dish.images && dish.images.length > 0 ? `http://localhost:8081${dish.images[0]}` : { dishImageDefault };

  return (
    <>
      {user.role.name === "customer" ? <NavCustomer /> : <NavUser />}
      <div className="containerR">
        <div className="product-detail">
          <div className="row row-cols-2 row-cols-md-1">
            <div className="col">
              <div className="product-detail__left">
                <img src={imageUrl} alt={dish.name || "Dish image"} className="product-detail__thumb" />
              </div>
            </div>
            <div className="col">
              <div className="product-detail__right">
                <h2 className="product-detail__heading">{dish.name}</h2>
                <div className="product-detail__rate">
                  <img src={starIcon} alt="" className="product-detail__star" />
                  <img src={starIcon} alt="" className="product-detail__star" />
                  <img src={starIcon} alt="" className="product-detail__star" />
                  <img src={starIcon} alt="" className="product-detail__star" />
                  <img src={starIcon} alt="" className="product-detail__star" />
                  <p className="product-detail__reviewer">(1 customer review)</p>
                </div>
                <span className="product-detail__price-product">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(dish.price || 0)}
                </span>
                <p className="product-detail__desc-product">{dish.description}</p>
                <div className="cart-item__input">
                  <div className="cart-item__input-left">
                    <button className="cart-item__input-btn cart-item__input-row" onClick={decreaseQuantity}>
                      <img src={minusIcon} alt="" />
                    </button>
                    <p className="cart-item__input-quantity cart-item__input-row">{quantity}</p>
                    <button className="cart-item__input-btn cart-item__input-row" onClick={increaseQuantity}>
                      <img src={plusIcon} alt="" />
                    </button>
                  </div>
                  <button className="cart-item__btn btn btn--primary" onClick={handleAddToCart}>
                    ADD TO CART{" "}
                  </button>
                </div>
                <div className="product-detail__origin">
                  <div className="product-detail__code">
                    SKU:
                    <span className="product-detail__code-name">PT322</span>
                  </div>
                  <div className="product-detail__code">
                    CATEGORY:
                    <span className="product-detail__code-name">{dish.category?.name}</span>
                  </div>
                  <div className="product-detail__code">
                    Restaurant:
                    <span className="product-detail__code-name">{dish.restaurant?.name}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="product-detail__bottom">
            <div className="product-detail__cate">
              <button className="product-detail__title product-detail__cate--active">Description</button>
              <button className="product-detail__title">Reviews(1)</button>
            </div>

            <div className="product-detail__index d-block">
              <p>
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean
                massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam
                felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede
                justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a,
                venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt.
              </p>
              <p>
                Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula,
                porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat
                a, tellus.
              </p>
            </div>

            <div className="product-detail__index d-none">
              <div className="product-detail-review">
                <div className="product-detail-review__left">
                  <img src="./assets/images/avatar/avatar-01.png" alt="" className="product-detail-review__avatar" />
                </div>
                <div className="product-detail-review__right">
                  <div className="product-detail-review__name">
                    Jamie Milson
                    <p>-</p>
                    <p className="product-detail-review__time">March 18, 2022</p>
                  </div>
                  <p className="product-detail-review__desc">
                    Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean
                    massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
                  </p>
                  <div className="product-detail-review__rate">
                    <img src={starIcon} alt="" className="product-detail-review__star" />
                    <img src={starIcon} alt="" className="product-detail-review__star" />
                    <img src={starIcon} alt="" className="product-detail-review__star" />
                    <img src={starIcon} alt="" className="product-detail-review__star" />
                    <img src={starIcon} alt="" className="product-detail-review__star" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};
export default DishDetail;
