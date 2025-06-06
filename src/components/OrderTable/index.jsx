import { Link } from 'react-router-dom';
import bookingArrowDown from '../../assets/icons/booking-arrow-down.svg';
import menuDecor01 from '../../assets/icons/menu-decor-01.svg';

import orderTableBg from '../../assets/images/order/order-06.png';

const OrderTable = () => {
    const orderTableStyle = {
        background: `url(${orderTableBg})`,
        backgroundOrigin: "content-box",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover"
    };
  return (
    <div className="order-06">
    <div className="containerR">
        <div className="row g-0 row-cols-md-1">
            <div className="col">
                <div className="order-06__left">
                    <h3 className="order-06__heading">Đặt chỗ ngay</h3>
                    <div className="order-06__booking">
                        <div className="order-06__set">
                            <span className="order-06__set-title">Ngày</span>
                            <div className="order-06__set-date">
                                <span className="order-06__set-date--now">21</span>
                                <div className="order-06__set-month">
                                    <p className="order-06__set-month--now">Tháng 9</p>
                                    <img src={bookingArrowDown} alt="booking" />
                                </div>
                            </div>
                        </div>

                        <div className="order-06__set">
                            <span className="order-06__set-title">Khách</span>
                            <div className="order-06__set-guests">
                                <span className="order-06__set-guests--now">2</span>
                                <div className="order-06__set-guests__icon">
                                </div>
                            </div>
                        </div>
                    </div>

                    <Link to={"/reservation"} className="order-06__act">
                         <button className="order-06__btn">Đặt ngay</button>
                    </Link>
                </div>
            </div>

            <div className="col">
                <div className="order-06__right" style={orderTableStyle }>
                   
                </div>
            </div>
        </div>
    </div>
    <img src={menuDecor01} alt="Decor" className="order-06__icon d-md-none" />
</div>
  );
}

export default OrderTable;