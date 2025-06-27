import { useEffect, useState } from "react";
import { getMyReservations } from "../../../services/reservationService";
import { Tag, Spin, Pagination } from "antd";

const MyTable = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // const user = JSON.parse(localStorage.getItem("user"));
  // const userId = user?.id;

  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const pageSize = 4;

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await getMyReservations({
          page: currentPage,
          limit: pageSize,
        });

        setReservations(res.results || []);
      } catch {
        setReservations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, [currentPage]);

  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const response = await getMyReservations({ page: 1, limit: 1 });
        setTotalResults(response.totalResults || 0);
      } catch {
        setTotalResults(0);
      }
    };
    fetchTotal();
    // eslint-disable-next-line
  }, []);

  function formatDate(dateString) {
    // Tạo đối tượng Date từ chuỗi ISO
    const date = new Date(dateString);

    // Lấy ngày, tháng, năm và đảm bảo luôn có 2 chữ số
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // getMonth() trả về 0-11
    const year = date.getFullYear();

    // Trả về chuỗi định dạng dd/mm/yyyy
    return `${day}/${month}/${year}`;
  }

  return (
    <>
      <h1 style={{ color: "#fff", margin: "24px 0 16px 0" }}>Thông tin bàn đã đặt</h1>

      <div style={{ background: "#23232b", borderRadius: 8, padding: 24 }}>
        {loading ? (
          <Spin />
        ) : reservations.length === 0 ? (
          <div style={{ color: "#fff" }}>Bạn chưa đặt bàn nào.</div>
        ) : (
          reservations.map((item) => (
            <div
              key={item.id}
              style={{
                background: "#282c34",
                borderRadius: 8,
                padding: 20,
                marginBottom: 20,
                color: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <div className="reservation-item">
                <div className="row">
                  <div className="col">
                    <div style={{ marginBottom: 8, color: "#1890ff" }}>
                      {item?.restaurant?.name || "Nhà hàng không xác định"}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <b>Bàn đặt:</b> {item.table?.name || "Chưa xác định"}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <b>Ngày đặt:</b> {formatDate(item.reservation_time)}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <b>Số điện thoại:</b> {item.phone || "Chưa xác định"}
                    </div>
                  </div>
                  <div className="col">
                    <div style={{ marginBottom: 8 }}>
                      <b>Địa chỉ:</b> {item.restaurant?.address || "Chưa xác định"}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <b>Số người:</b> {item.number_of_people}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <b>Thời gian đặt:</b> {item.timeSlot || "Chưa xác định"}
                    </div>
                    <div>
                      <b>Trạng thái:</b>{" "}
                      <Tag
                        color={
                          item.status === "pending"
                            ? "blue"
                            : item.status === "completed"
                            ? "green"
                            : item.status === "confirmed"
                            ? "orange"
                            : "red"
                        }
                      >
                        {item.status || "Không xác định"}
                      </Tag>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Pagination */}
      {!loading && totalResults > pageSize && (
        <div style={{ marginTop: 24, textAlign: "end" }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalResults}
            onChange={setCurrentPage}
            showTotal={(totals, range) => `${range[0]}-${range[1]} của ${totals} đặt bàn`}
            showSizeChanger={false}
          />
        </div>
      )}
    </>
  );
};

export default MyTable;
