import { useState } from 'react';
import { useCart } from '../../components/context/cartContext';
import { createOrder } from '../../services/orderService';
import Footer from '../../../components/layouts/footer';

const Checkout = () => {
  return (
    <>
      <main className="checkout-page">
            <div className="containerR">
                <div className="checkout">
                    <div className="row row-cols-2 g-3 row-cols-lg-1">
                        <div className="col">
                            <div className="checkout-bill">
                                <h4 className="checkout-bill__heading">Billing details</h4>
                                <form action="" className="form">
                                    <div className="checkout-bill-form">
                                        <div className="checkout-bill-form__group">
                                            <label for="full-name" className="checkout-bill-form__title">Full Name</label>
                                            <input
                                                type="text"
                                                id="full-name"
                                                name="full-name"
                                                placeholder="Nhập tên của bạn"
                                                className="checkout-bill-form__input"
                                                pattern="\S+.*"
                                                required
                                            />
                                        </div>

                                        <div className="checkout-bill-form__group">
                                            <label for="email-address" className="checkout-bill-form__title">
                                                Email address
                                            </label>
                                            <input
                                                type="email"
                                                id="email-address"
                                                name="email-address"
                                                placeholder="Nhập email của bạn"
                                                className="checkout-bill-form__input"
                                                pattern="\S+.*"
                                                required
                                            />
                                        </div>

                                        <div className="checkout-bill-form__group">
                                            <label for="phone-number" className="checkout-bill-form__title">
                                                Phone number
                                            </label>
                                            <input
                                                type="number"
                                                id="phone-number"
                                                name="phone-number"
                                                placeholder="Điền SĐT"
                                                className="checkout-bill-form__input"
                                                required
                                            />
                                        </div>

                                        <div className="checkout-bill-form__group">
                                            <label for="home-address" className="checkout-bill-form__title">Address</label>
                                            <input
                                                type="text"
                                                id="home-address"
                                                name="home-address"
                                                placeholder="Nhập địa chỉ giao hàng"
                                                className="checkout-bill-form__input"
                                                pattern="\S+.*"
                                                required
                                            />
                                        </div>
                                    </div>
                                </form>
                                <button className="checkout-bill__btn">Order</button>
                            </div>
                        </div>
                        <div className="col">
                            <div className="checkout-order">
                                <h4 className="checkout-order__heading">Your order</h4>

                                <table>
                                    <thead>
                                        <tr>
                                            <th>Food</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Crispy chicken breasts x 1</td>
                                            <td>$24.99</td>
                                        </tr>
                                        <tr>
                                            <td>Spaghetti Napoletana x 1</td>
                                            <td>$59.00</td>
                                        </tr>
                                        <tr>
                                            <td>Subtotal</td>
                                            <td>$59.00</td>
                                        </tr>
                                        <tr>
                                            <td>Shipping</td>
                                            <td>Flat rate: $6.00</td>
                                        </tr>
                                        <tr>
                                            <td>Total</td>
                                            <td>$89.99</td>
                                        </tr>
                                    </tbody>
                                </table>
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
