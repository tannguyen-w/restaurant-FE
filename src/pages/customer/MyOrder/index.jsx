import {getMyOrders} from "../../../services/orderService";

const MyOrder = () => {
  return (
    <div>
      <h1>Đơn hàng</h1>
      {getMyOrders && getMyOrders.length > 0 ? (<>
        
      </>) : (<><p>Bạn chưa mua đơn nào</p></>)}
    </div>
  );
}

export default MyOrder;