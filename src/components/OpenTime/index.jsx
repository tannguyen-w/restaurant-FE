import openTimeImage from "../../assets/images/order/order-07.png";

const OpenTime = () => {
    const openTimeStyle = {
        background: `url(${openTimeImage})`,backgroundPosition: "center",
        backgroundSize: "cover",}


  return (
    <>
      <div className="containerR">
        <div className="order-07">
          <div className="row g-0 row-cols-md-1">
            <div className="col">
              <div className="order-07-left" style={openTimeStyle}>
                <div className="order-07-left__inner">
                  <h4 className="order-07-left__title">Tìm chúng tôi tại đây</h4>
                  <div className="order-07-left__content">
                    <p className="order-07-left__desc">
                      171 Trần Phú, Nam Thành, Ninh Bình
                    </p>
                    <p className="order-07-left__desc">+0123 456 7890</p>
                    <p className="order-07-left__desc">vanhoa@contact.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col">
              <div className="order-07-right">
                <div className="order-07-right__inner">
                  <h4 className="order-07-right__title">Thời gian mở cửa</h4>

                  <div className="order-07-right__timeline">
                    <p className="order-07-right__day">Thứ hai</p>
                    <p className="order-07-right__time">17:00 to 23:00</p>
                  </div>

                  <div className="order-07-right__timeline">
                    <p className="order-07-right__day">Thứ ba</p>
                    <p className="order-07-right__time">17:00 to 23:00</p>
                  </div>

                  <div className="order-07-right__timeline">
                    <p className="order-07-right__day">Thứ tư</p>
                    <p className="order-07-right__time">17:00 to 23:00</p>
                  </div>

                  <div className="order-07-right__timeline">
                    <p className="order-07-right__day">Thứ năm</p>
                    <p className="order-07-right__time">17:00 to 23:00</p>
                  </div>

                  <div className="order-07-right__timeline">
                    <p className="order-07-right__day">Thứ sáu</p>
                    <p className="order-07-right__time">17:00 to 23:00</p>
                  </div>

                  <div className="order-07-right__timeline">
                    <p className="order-07-right__day">T7/CN</p>
                    <p className="order-07-right__time">17:00 to 23:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default OpenTime;
