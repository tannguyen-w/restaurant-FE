import { useEffect, useState } from "react";
import { getMyOrders } from "../../../services/orderService";
import { getOrderDetailById } from "../../../services/orderDetailService";
import { Tag, Modal, Spin, Descriptions, Pagination } from "antd";

const MyOrder = () => {
  const [orders, setOrders] = useState([]);
  const [totals, setTotals] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [detailModal, setDetailModal] = useState({
    open: false,
    loading: false,
    data: null,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchMyOrders = async () => {
      setIsLoading(true);
      try {
        const response = await getMyOrders({ page: currentPage, limit: pageSize });
        const orderList = response.results || [];
        setOrders(orderList);

        const totalsObj = {};
        await Promise.all(
          orderList.map(async (order) => {
            const details = await getOrderDetailById(order.id);
            totalsObj[order.id] = details.total;
          })
        );
        setTotals(totalsObj);
      } catch {
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyOrders();
  }, [currentPage]);

  const handleShowDetail = async (order) => {
    setDetailModal({ open: true, loading: true, data: null });
    try {
      const details = await getOrderDetailById(order.id);
      setDetailModal({ open: true, loading: false, data: details });
    } catch {
      setDetailModal({ open: true, loading: false, data: null });
    }
  };

  // Giả sử tổng số đơn hàng lấy từ API (nếu có)
  const [totalResults, setTotalResults] = useState(0);
  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const response = await getMyOrders({ page: 1, limit: 1 });
        setTotalResults(response.totalResults || 0);
      } catch {
        setTotalResults(0);
      }
    };
    fetchTotal();
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      <h1 style={{ color: "#fff", margin: "24px 0 16px 0" }}>Đơn hàng</h1>
      <div className="custom-table-wrapper">
        <div className="custom-table">
          <div className="custom-table-row custom-table-header">
            <div className="custom-table-cell" style={{ color: "#ffb700" }}>
              Mã đơn hàng
            </div>
            <div className="custom-table-cell" style={{ color: "#ffb700" }}>
              Ngày đặt
            </div>
            <div className="custom-table-cell" style={{ color: "#ffb700" }}>
              Tổng tiền
            </div>
            <div className="custom-table-cell" style={{ color: "#ffb700" }}>
              Trạng thái
            </div>
          </div>
          {isLoading ? (
            <div className="custom-table-row">
              <div className="custom-table-cell" colSpan={4}>
                <Spin />
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="custom-table-row">
              <div className="custom-table-cell" colSpan={4}>
                Bạn chưa mua đơn nào
              </div>
            </div>
          ) : (
            orders.map((order) => (
              <div className="custom-table-row" key={order.id}>
                <div className="custom-table-cell">
                  <a style={{ color: "#4096ff", cursor: "pointer" }} onClick={() => handleShowDetail(order)}>
                    {order.id}
                  </a>
                </div>
                <div className="custom-table-cell">
                  {(() => {
                    const d = new Date(order.orderTime);
                    const pad = (n) => n.toString().padStart(2, "0");
                    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(
                      d.getMinutes()
                    )}:${pad(d.getSeconds())}`;
                  })()}
                </div>
                <div className="custom-table-cell">
                  {totals[order.id] === undefined ? <Spin size="small" /> : totals[order.id].toLocaleString() + " đ"}
                </div>
                <div className="custom-table-cell">
                  <Tag color={order.status === "completed" ? "green" : order.status === "cancelled" ? "red" : "blue"}>
                    {order.status}
                  </Tag>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalResults > pageSize && (
          <div style={{ marginTop: 24, textAlign: "end" }}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalResults}
              onChange={setCurrentPage}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>
      <Modal
        open={detailModal.open}
        onCancel={() => setDetailModal({ ...detailModal, open: false })}
        title="Chi tiết đơn hàng"
        footer={null}
        width={700}
      >
        {detailModal.loading ? (
          <Spin />
        ) : detailModal.data ? (
          <>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Tổng tiền">{detailModal.data.total?.toLocaleString()} đ</Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Danh sách món:</div>
              <div>
                {detailModal.data.data.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 12,
                      borderRadius: 6,
                      padding: 8,
                    }}
                  >
                    <img
                      src={
                        item.dish && item.dish.images && item.dish.images.length > 0
                          ? `http://localhost:8081${item.dish.images[0]}`
                          : "https://via.placeholder.com/60"
                      }
                      alt={item.dish ? item.dish.name : "Món không xác định"}
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: "cover",
                        borderRadius: 4,
                        marginRight: 16,
                        background: "#fff",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{item.dish ? item.dish.name : "Món không xác định"}</div>
                      <div style={{ fontSize: 13 }}>
                        Số lượng: <b>{item.quantity}</b>
                        {"  |  "}
                        Đơn giá: <b>{item.price?.toLocaleString()} đ</b>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div>Không lấy được chi tiết đơn hàng.</div>
        )}
      </Modal>
    </div>
  );
};

export default MyOrder;
