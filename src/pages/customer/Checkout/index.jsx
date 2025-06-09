import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../components/context/cartContext";
import { useAuth } from "../../../components/context/authContext";
import { createOrder } from "../../../services/orderService";
import { createOrderDetail } from "../../../services/orderDetailService";
import Footer from "../../../components/layouts/footer";
import NavCustomer from "../../../components/NavCustomer";
import { message, Spin } from "antd";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  // Phí vận chuyển
  const shippingFee = 30000;

  // Form state
  const [formData, setFormData] = useState({
    fullName: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    note: "",
  });

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle order submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address) {
      message.error({
        content: "Vui lòng điền đầy đủ thông tin",
        style: { color: "#000" },
      });
      return;
    }

    if (cartItems.length === 0) {
      message.error({
        content: "Giỏ hàng của bạn đang trống",
        style: { color: "#000" },
      });
      return;
    }

    const orderData = {
      customer: user?.id, // Thêm ID của người đăng nhập
      table: "6846cba58f5f107bd0cad50b", // Bàn mặc định
      fullName: formData.fullName,
      phone: formData.phone,
      address: formData.address,
      note: formData.note,
      orderType: "online",
    };

    try {
      setIsLoading(true);
      // 1. Tạo đơn hàng
      const orderResponse = await createOrder(orderData);

      const orderId = orderResponse.id;
      let successCount = 0;

      // 2. Tạo chi tiết đơn hàng lần lượt cho từng món
      for (const item of cartItems) {
        try {
          // Trong console log, item.id là undefined, nên cần xem cấu trúc thực của item

          const orderDetailData = {
            order: orderId,
            // Nếu không có id, thử dùng _id hoặc thuộc tính khác của item
            dish: item._id || item.dish_id || item.dishId || item.id,
            quantity: item.quantity,
            price: item.price,
          };

          await createOrderDetail(orderDetailData);
          successCount++;
        } catch (detailError) {
          console.error("Failed to create detail:", detailError);
          // Tiếp tục với món tiếp theo
        }
      }

      // Xử lý thành công hoặc một phần thành công
      if (successCount === cartItems.length) {
        message.success({
          content: `Đặt hàng thành công! Mã đơn hàng: ${orderId}`,
          style: { color: "#000" },
          duration: 5,
        });
      } else if (successCount > 0) {
        message.warning({
          content: `Đặt hàng thành công, nhưng một số món có thể chưa được ghi nhận. Mã đơn hàng: ${orderId}`,
          style: { color: "#000" },
          duration: 5,
        });
      } else {
        message.warning({
          content: `Đơn hàng đã được tạo, nhưng không thể lưu chi tiết các món. Mã đơn hàng: ${orderId}`,
          style: { color: "#000" },
          duration: 5,
        });
      }
      // Xóa giỏ hàng
      clearCart();

      // Chuyển hướng đến trang xác nhận
      navigate("/profile/orders", {
        state: {
          orderInfo: orderResponse,
          orderItems: cartItems,
          shippingFee,
          totalAmount: cartTotal + shippingFee,
        },
      });
    } catch (error) {
      console.error("Order creation failed:", error);
      message.error({
        content: "Đặt hàng thất bại. Vui lòng thử lại!",
        style: { color: "#000" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <NavCustomer />
      <main className="checkout-page">
        <div className="containerR">
          <div className="checkout">
            <div className="row row-cols-2 g-3 row-cols-lg-1">
              <div className="col">
                <div className="checkout-bill">
                  <h4 className="checkout-bill__heading">Thông tin thanh toán</h4>
                  <form onSubmit={handleSubmit} className="form">
                    <div className="checkout-bill-form">
                      <div className="checkout-bill-form__group">
                        <label htmlFor="fullName" className="checkout-bill-form__title">
                          Họ và tên
                        </label>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          placeholder="Nhập tên của bạn"
                          className="checkout-bill-form__input"
                          pattern="\S+.*"
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="checkout-bill-form__group">
                        <label htmlFor="email" className="checkout-bill-form__title">
                          Địa chỉ Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          placeholder="Nhập email của bạn"
                          className="checkout-bill-form__input"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="checkout-bill-form__group">
                        <label htmlFor="phone" className="checkout-bill-form__title">
                          Số điện thoại
                        </label>
                        <input
                          type="number"
                          id="phone"
                          name="phone"
                          placeholder="Điền SĐT"
                          className="checkout-bill-form__input"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="checkout-bill-form__group">
                        <label htmlFor="address" className="checkout-bill-form__title">
                          Địa chỉ giao hàng
                        </label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          placeholder="Nhập địa chỉ giao hàng"
                          className="checkout-bill-form__input"
                          value={formData.address}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="checkout-bill-form__group">
                        <label htmlFor="note" className="checkout-bill-form__title">
                          Ghi chú
                        </label>
                        <input
                          type="text"
                          id="note"
                          name="note"
                          placeholder="Nhập ghi chú (nếu có)"
                          className="checkout-bill-form__input"
                          value={formData.note}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <button type="submit" className="checkout-bill__btn" disabled={isLoading || cartItems.length === 0}>
                      {isLoading ? <Spin size="small" /> : "Đặt hàng"}
                    </button>
                  </form>
                </div>
              </div>

              <div className="col">
                <div className="checkout-order">
                  <h4 className="checkout-order__heading">Đơn hàng của bạn</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Món ăn</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.length > 0 ? (
                        <>
                          {cartItems.map((item) => (
                            <tr key={item.id}>
                              <td>
                                {item.name} x {item.quantity}
                              </td>
                              <td>{formatPrice(item.price * item.quantity)}</td>
                            </tr>
                          ))}
                          <tr className="subtotal-row">
                            <td>Tạm tính</td>
                            <td>{formatPrice(cartTotal)}</td>
                          </tr>
                          <tr className="shipping-row">
                            <td>Phí giao hàng</td>
                            <td>{formatPrice(shippingFee)}</td>
                          </tr>
                          <tr className="total-row">
                            <td>Tổng cộng</td>
                            <td className="total-price">{formatPrice(cartTotal + shippingFee)}</td>
                          </tr>
                        </>
                      ) : (
                        <tr>
                          <td colSpan="2" className="empty-cart-message">
                            Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div className="payment-methods">
                    <h5>Phương thức thanh toán</h5>
                    <div className="payment-method">
                      <input type="radio" id="cod" name="payment_method" value="cod" defaultChecked />
                      <label htmlFor="cod">Thanh toán khi nhận hàng (COD)</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Checkout;
