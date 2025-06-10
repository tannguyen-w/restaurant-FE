import { useEffect, useState } from "react";
import { getMyReservations } from "../../../services/reservationService";
import { Tag, Spin } from "antd";

const MyTable = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await getMyReservations(userId);
        setReservations(res.results || []);
      } catch {
        setReservations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

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
              <div style={{ marginBottom: 8 }}>
                <b>Thời gian đặt:</b> {item.timeSlot}
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Số người:</b> {item.number_of_people}
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Số điện thoại:</b> {item.phone}
              </div>
              <div>
                <b>Trạng thái:</b>{" "}
                <Tag color={item.status === "pending" ? "blue" : item.status === "completed" ? "green" : "red"}>
                  {item.status}
                </Tag>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default MyTable;
