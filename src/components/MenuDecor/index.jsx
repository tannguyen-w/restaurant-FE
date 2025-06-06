import decorImamge from "../../assets/images/order/order-03.png";

const MenuDecor = () => {
    return (
        <div className="order-03">
            <div className="containerR">
                <div className="order-03__content">
                    <div className="row">
                        <div className="col col-8 col-md-12">
                            <div className="order-03__inner">
                                <h2 className="order-03__heading">Nhận giao hàng miễn phí!</h2>
                                <p className="order-03__desc">
                                    Như bạn đã biết, chúng tôi rất nổi tiếng và luôn kín chỗ vào mọi ngày. Vì vậy, hãy đặt bàn trước để đảm bảo bạn có chỗ ngồi nhé!
                                </p>
                                <h4 className="order-03__call">Call: +123666604</h4>
                            </div>
                        </div>
                        <div className="col col-4 col-md-12">
                            <div className="order-03__right">
                                <img src={decorImamge} alt="" className="order-03__thumb" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}   
export default MenuDecor;