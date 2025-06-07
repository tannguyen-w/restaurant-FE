import { useState } from "react";
import { useCart } from "../../../components/context/cartContext";

import NavCustomer from "../../../components/NavCustomer";
import Footer from "../../../components/layouts/Footer";
import { Link } from "react-router-dom";
import { Popconfirm, message } from "antd";

import minusIcon from "../../../assets/icons/minus.svg";
import plusIcon from "../../../assets/icons/plus.svg";
import deleteIcon from "../../../assets/icons/delete.svg";
import emptyCartIcon from "../../../assets/icons/traced-02.svg";

const Cart = () => {
  const { cartItems, cartTotal, updateQuantity, removeFromCart } =
    useCart();
  const [voucher, setVoucher] = useState("");
  const baseUrl = "http://localhost:8081";

  // Tăng số lượng sản phẩm
  const handleIncreaseQuantity = (item) => {
    try {
      updateQuantity(item.id, item.quantity + 1);
      message.success({
        content: `Đã tăng số lượng ${item.name}`,
        style: { color: "#000" },
      });
    } catch (error) {
      console.error("Error increasing quantity:", error);
      message.error({
        content: "Có lỗi xảy ra khi cập nhật số lượng",
        style: { color: "#000" },
      });
    }
  };

  // Giảm số lượng sản phẩm
  const handleDecreaseQuantity = (item) => {
    if (item.quantity <= 1) {
      message.info({
        content: "Số lượng tối thiểu là 1",
        style: { color: "#000" },
      });
      return;
    }

    try {
      updateQuantity(item.id, item.quantity - 1);
      message.success({
        content: `Đã giảm số lượng ${item.name}`,
        style: { color: "#000" },
      });
    } catch (error) {
      console.error("Error decreasing quantity:", error);
      message.error({
        content: "Có lỗi xảy ra khi cập nhật số lượng",
        style: { color: "#000" },
      });
    }
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const handleRemoveItem = (item) => {
    try {
      removeFromCart(item.id);
      message.success({
        content: `Đã xóa ${item.name} khỏi giỏ hàng`,
        style: { color: "#000" },
      });
    } catch (error) {
      console.error("Error removing item:", error);
      message.error({
        content: "Có lỗi xảy ra khi xóa sản phẩm",
        style: { color: "#000" },
      });
    }
  };

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Tính tổng tiền cho mỗi sản phẩm
  const calculateSubtotal = (price, quantity) => {
    return price * quantity;
  };

  // Cập nhật giỏ hàng
  const handleUpdateCart = () => {
    message.success({
      content: "Đã cập nhật giỏ hàng",
      style: { color: "#000" },
    });
  };

  // Áp dụng voucher
  const handleApplyVoucher = () => {
    if (!voucher.trim()) {
      message.warning({
        content: "Vui lòng nhập mã giảm giá",
        style: { color: "#000" },
      });
      return;
    }

    message.info({
      content: "Chức năng mã giảm giá đang được phát triển",
      style: { color: "#000" },
    });
  };

  return (
    <>
      <NavCustomer />
      <div className="cart-ordered">
        <div className="containerR">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <img
                src={emptyCartIcon}
                alt="Giỏ hàng trống"
                className="empty-cart-icon"
              />
              <h3>Giỏ hàng của bạn đang trống</h3>
              <p>Hãy thêm một vài món ăn từ thực đơn của chúng tôi</p>
              <Link to="/menu" className="btn btn--primary">
                Xem thực đơn
              </Link>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th></th>
                  <th>Món ăn</th>
                  <th>Đơn giá</th>
                  <th>Số lượng</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>

              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="cart-ordered__delete">
                        <Popconfirm
                          title="Xác nhận xóa"
                          description="Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?"
                          onConfirm={() => handleRemoveItem(item)}
                          okText="Xoá"
                          cancelText="Huỷ"
                        >
                          <button className="cart-ordered__delete-btn">
                            <img
                              src={deleteIcon}
                              className="cart-ordered__delete-icon"
                              alt="Xóa"
                            />
                          </button>
                        </Popconfirm>
                      </div>
                    </td>
                    <td>
                      <div className="cart-ordered__thumb">
                        <img
                          src={
                            item.images && item.images.length > 0
                              ? `${baseUrl}${item.images[0]}`
                              : "./assets/images/menu/menu-breakfast-01.png"
                          }
                          className="cart-ordered__thumb-item"
                          alt={item.name}
                        />
                      </div>
                    </td>
                    <td data-label="Food">{item.name}</td>
                    <td data-label="Price">{formatPrice(item.price)}</td>
                    <td data-label="Quantity">
                      <div className="cart-item__input">
                        <div className="cart-item__input-left">
                          <button
                            className="cart-item__input-btn cart-item__input-row"
                            onClick={() => handleDecreaseQuantity(item)}
                          >
                            <img src={minusIcon} alt="Giảm" />
                          </button>
                          <p className="cart-item__input-quantity cart-item__input-row">
                            {item.quantity}
                          </p>
                          <button
                            className="cart-item__input-btn cart-item__input-row"
                            onClick={() => handleIncreaseQuantity(item)}
                          >
                            <img src={plusIcon} alt="Tăng" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td data-label="Subtotal">
                      {formatPrice(
                        calculateSubtotal(item.price, item.quantity)
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  <td colSpan={5}>
                    <div className="cart-ordered__voucher">
                      <input
                        type="text"
                        placeholder="Mã giảm giá"
                        className="cart-ordered__btn cart-ordered__voucher-code"
                        value={voucher}
                        onChange={(e) => setVoucher(e.target.value)}
                      />
                      <button
                        className="btn btn--primary cart-ordered__btn cart-ordered__voucher-apply"
                        onClick={handleApplyVoucher}
                      >
                        Áp dụng
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="cart-ordered__update">
                      <button
                        className="btn btn--primary cart-ordered__btn cart-ordered__update-btn"
                        onClick={handleUpdateCart}
                      >
                        Cập nhật giỏ hàng
                      </button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td colSpan={4}></td>
                  <td>
                    <strong>Tổng cộng:</strong>
                  </td>
                  <td>
                    <strong>{formatPrice(cartTotal)}</strong>
                  </td>
                </tr>
                <tr>
                  <td colSpan={4}></td>
                  <td colSpan={2}>
                    <div className="cart-actions">
                      <Link
                        to="/menu"
                        className="btn btn--secondary cart-continue-btn"
                      >
                        Tiếp tục mua sắm
                      </Link>
                      <Link
                        to="/checkout"
                        className="btn btn--primary cart-checkout-btn"
                      >
                        Tiến hành thanh toán
                      </Link>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Cart;
