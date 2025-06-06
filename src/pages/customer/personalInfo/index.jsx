import { Link, NavLink, useOutletContext } from "react-router-dom";

import planeBgIcon from "../../../assets/images/card/plane-bg.svg";
import planeIcon from "../../../assets/images/card/plane.svg";
import phoneIcon from "../../../assets/icons/phone.svg";
import leafIcon from "../../../assets/images/card/leaf.svg";
import leafBgIcon from "../../../assets/images/card/leaf-bg.svg";
import ovalIcon from "../../../assets/images/card/oval.svg";
import plusIcon from "../../../assets/icons/plus.svg";
import addressIcon from "../../../assets/icons/address.svg";
import messageIcon from "../../../assets/icons/message.svg";

const PersonalInfo = () => {
  const { userProfile } = useOutletContext();
  return (
    <div className="cart-info">
      <div className="row gy-3">
        {/* <!-- My wallet --> */}
        <div className="col-12">
          <h2 className="cart-info__heading">Ví của tôi</h2>
          <p className="cart-info__desc profile__desc">
            Phương thức thanh toán
          </p>

          <div className="row row-cols-3 row-cols-xl-2 row-cols-lg-1">
            {/* <!-- Payment method 1 --> */}
            <div className="col">
              <article
                className="payment-card"
                style={{ "--bg-color": "#1e2e69" }}
              >
                <img src={planeBgIcon} alt="" className="payment-card__img" />
                <div className="payment-card__top">
                  <img src={planeIcon} alt="" />
                  <span className="payment-card__type">FeatherCard</span>
                </div>
                <div className="payment-card__number">1234 4567 8901 2221</div>
                <div className="payment-card__bottom">
                  <div className="payment-card__bottom-left">
                    <p className="payment-card__label">Chủ thẻ</p>
                    <p className="payment-card__value">{userProfile.name}</p>
                  </div>
                  <div className="payment-card__bottom-mid">
                    <p className="payment-card__label">Hết hạn</p>
                    <p className="payment-card__value">10/22</p>
                  </div>
                  <div className="payment-card__circle">
                    <img
                      src={ovalIcon}
                      alt=""
                      className="payment-card__circle-img"
                    />
                  </div>
                </div>
              </article>
            </div>

            {/* <!-- Payment method 2 --> */}
            <div className="col">
              <article
                className="payment-card"
                style={{ "--bg-color": "#354151" }}
              >
                <img src={leafBgIcon} alt="" className="payment-card__img" />
                <div className="payment-card__top">
                  <img src={leafIcon} alt="" />
                  <span className="payment-card__type">FeatherCard</span>
                </div>
                <div className="payment-card__number">1234 4567 8901 2221</div>
                <div className="payment-card__bottom">
                  <div className="payment-card__bottom-left">
                    <p className="payment-card__label">Chủ thẻ</p>
                    <p className="payment-card__value">{userProfile.name}</p>
                  </div>
                  <div className="payment-card__bottom-mid">
                    <p className="payment-card__label">Hết hạn</p>
                    <p className="payment-card__value">11/22</p>
                  </div>
                  <div className="payment-card__circle">
                    <img
                      src={ovalIcon}
                      alt=""
                      className="payment-card__circle-img"
                    />
                  </div>
                </div>
              </article>
            </div>

            {/* <!-- Add new payment card --> */}
            <div className="col">
              <Link to="/add-card" className="new-card">
                <img src={plusIcon} alt="" className="icon new-card__icon" />
                <p className="new-card__text">Thêm thẻ mới</p>
              </Link>
            </div>
          </div>
        </div>

        {/* <!-- Account info --> */}
        <div className="col-12">
          <h2 className="cart-info__heading">Thông tin tài khoản</h2>
          <p className="cart-info__desc profile__desc">
            Địa chỉ, thông tin liên hệ và mật khẩu
          </p>
          <div className="row row-cols-2 row-cols-lg-1">
            {/* <!-- Account info 1 --> */}
            <div className="col">
              <NavLink to={"/profile/edit"} >
                <article className="account-info">
                  <div className="account-info__icon">
                    <img
                      src={messageIcon}
                      alt=""
                      className="icon"
                    />
                  </div>
                  <div>
                    <h3 className="account-info__title">Email</h3>
                    <p className="account-info__desc">{userProfile.email}</p>
                  </div>
                </article>
              </NavLink>
            </div>

            {/* <!-- Account info 2 --> */}
            <div className="col">
              <Link to="/profile/edit">
                <article className="account-info">
                  <div className="account-info__icon">
                    <img src={phoneIcon} alt="" className="icon" />
                  </div>
                  <div>
                    <h3 className="account-info__title">Số điện thoại</h3>
                    <p className="account-info__desc">{userProfile.phone}</p>
                  </div>
                </article>
              </Link>
            </div>

            {/* <!-- Account info 3 --> */}
            <div className="col">
              <Link to="/profile/edit">
                <article className="account-info">
                  <div className="account-info__icon">
                    <img src={addressIcon} alt="" className="icon" />
                  </div>
                  <div>
                    <h3 className="account-info__title">Địa chỉ</h3>
                    <p className="account-info__desc">{userProfile.address}</p>
                  </div>
                </article>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
