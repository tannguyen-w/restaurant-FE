import { Link } from "react-router-dom";

import logo from "../../assets/icons/logo.svg";
import iosApp from "../../assets/images/link-app/ios-app.png";
import androidApp from "../../assets/images/link-app/android-app.png";

const Footer = () => {
  return (
    <> <div className="footer">

      <div className="containerR">
        <Link to={"/"} className="logo footer__logo d-none d-md-flex">
          <img
            src={logo}
            alt="Nhà hàng Vạn Hoa"
            className="icon logo__img"
          />
          <h1 className="logo__title footer__logo-title">Nhà hàng Vạn Hoa</h1>
        </Link>
      
        <div className="footer__row">
          {/* <!-- Footer Column 1 --> */}
          <div className="footer__col d-md-none">
            <Link to={"/"} className="logo footer__logo">
              <img
                src={logo}
                alt="Nhà hàng Vạn Hoa"
                className="icon logo__img"
              />
              <h1 className="logo__title footer__logo-title">Nhà hàng Vạn Hoa</h1>
            </Link>

            <div className="footer-link d-md-none">
              <p className="footer-link__desc">
                Download the WowWraps app today.
              </p>
              <div className="footer-link__thumbs">
                <a href="#!">
                  <img
                    src={iosApp}
                    alt=""
                    className="footer-link__thumb"
                  />
                </a>
                <a href="#!">
                  <img
                    src={androidApp}
                    alt=""
                    className="footer-link__thumb"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* <!-- Footer Column 2 --> */}
          <div className="footer__col">
            <h3 className="footer__heading">Trang</h3>
            <ul className="footer__list">
              <li>
                <Link to={"/"} className="footer__link">
                  Trang chủ
                </Link>
              </li>
              <li>
                <a href="#!" className="footer__link">
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a href="#!" className="footer__link">
                  Dịch vụ
                </a>
              </li>
              <li>
                <a href="#!" className="footer__link">
                  Đặt bàn
                </a>
              </li>
              <li>
                <a href="#!" className="footer__link">
                  Thực đơn
                </a>
              </li>
            </ul>
          </div>

          {/* <!-- Footer Column 3 --> */}
          <div className="footer__col">
            <h3 className="footer__heading">Thông tin liên hệ</h3>
            <ul className="footer__list">
              <li>
                <p className="footer__link">
                  177 Trần Phú, Nam Thành, Ninh Bình
                </p>
              </li>
              <li>
                <a
                  href="mailto:contact@nhahangvanhoa.com"
                  className="footer__link"
                >
                  contact@nhahangvanhoa.com
                </a>
              </li>
              <li>
                <a href="telto:18008888" className="footer__link">
                  800-123-45-678
                </a>
              </li>
            </ul>
          </div>

          {/* <!-- Footer Column 4 --> */}
          <div className="footer__col">
            <h3 className="footer__heading">Theo dõi chúng tôi</h3>
            <ul className="footer__list">
              <li>
                <Link to={"https://www.facebook.com/khachsanvanhoaninhbinh/?locale=vi_VN"}
                target="_blank"
                  className="footer__link footer__follow"
                >
                  Facebook
                </Link>
              </li>
              <li>
                <Link to={"https://hotrodukhachninhbinh.vn/vi/thanh-pho-ninh-binh/nha-hang-van-hoa-97.html"}
                  className="footer__link footer__follow"
                  target="_blank"
                >
                  Instagram
                </Link>
              </li>
              <li>
                <Link to={"https://www.facebook.com/trongtan.nguyen.988926"}
                target="_blank"
                  className="footer__link footer__follow"
                >
                  Linkedin
                </Link>
              </li>
              <li>
                <Link to={"https://www.facebook.com/trongtan.nguyen.988926"}
                  target="_blank"
                  className="footer__link footer__follow"
                >
                  Twitter
                </Link>
              </li>
              <li>
                <Link
                  target="_blank" to={"https://www.facebook.com/trongtan.nguyen.988926"}
                  className="footer__link footer__follow"
                >
                  Zalo
                </Link>
              </li>
            </ul>
          </div>

          {/* <!-- Footer Column 5 --> */}
          <div className="footer__col d-sm-none">
            <h3 className="footer__heading">Legal</h3>
            <ul className="footer__list">
              <li>
                <p className="footer__link">Website by Tan Nguyen</p>
              </li>
              <li>
                <p href="" className="footer__link">
                  ©2025. All Rights Reserved
                </p>
              </li>
            </ul>
          </div>

          {/* <!-- Footer Column 6 --> */}
          <div className="footer__col d-sm-none">
            <div className="footer-link d-none d-md-block">
              <p className="footer-link__desc">
                Download the WowWraps app today.
              </p>
              <div className="footer-link__thumbs">
                <a href="#!">
                  <img
                    src="./assets/images/link-app/ios-app.png"
                    alt=""
                    className="footer-link__thumb"
                  />
                </a>
                <a href="#!">
                  <img
                    src="./assets/images/link-app/android-app.png"
                    alt=""
                    className="footer-link__thumb"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer__legal d-none d-sm-block">
          <h3 className="footer__heading">Legal</h3>
          <ul className="footer__list">
            <li>
              <p className="footer__link">Website by Tan Nguyen</p>
            </li>
            <li>
              <p href="" className="footer__link">
                ©2025. All Rights Reserved
              </p>
            </li>
          </ul>
        </div>

        <div className="footer__download d-none d-sm-block">
          <div className="footer-link d-none d-md-block">
            <p className="footer-link__desc">
              Download the WowWraps app today.
            </p>
            <div className="footer-link__thumbs">
              <a href="#!">
                <img
                  src={iosApp}
                  alt=""
                  className="footer-link__thumb"
                />
              </a>
              <a href="#!">
                <img
                  src={androidApp}
                  alt=""
                  className="footer-link__thumb"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};
export default Footer;
