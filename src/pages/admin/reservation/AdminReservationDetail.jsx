import { useEffect } from "react";
import { Descriptions, Badge, Tag, Space, Divider, Timeline } from "antd";
import moment from "moment";
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const statusColors = {
  pending: "gold",
  confirmed: "blue",
  completed: "green",
  cancelled: "red",
};

const statusText = {
  pending: "Đang chờ",
  confirmed: "Đã xác nhận",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const statusIcon = {
  pending: <ClockCircleOutlined style={{ color: "#faad14" }} />,
  confirmed: <CheckCircleOutlined style={{ color: "#1890ff" }} />,
  completed: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
  cancelled: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
};

const AdminReservationDetail = ({ reservation }) => {
  // Giả định có trường history trong reservation
  // Trong thực tế, có thể cần cập nhật API để trả về lịch sử thay đổi
  const reservationHistory = reservation.history || [
    {
      timestamp: reservation.createdAt || new Date(),
      status: "pending",
      action: "Tạo mới đặt bàn",
    },
    ...(reservation.status !== "pending"
      ? [
          {
            timestamp: new Date(),
            status: reservation.status,
            action: `Cập nhật trạng thái thành ${statusText[reservation.status]}`,
          },
        ]
      : []),
  ];

  // Khởi tạo các time slots
  useEffect(() => {
    const slots = [];
    const start = moment().startOf("day").add(10, "hours"); // 10:00 AM
    const end = moment().startOf("day").add(21, "hours"); // 9:00 PM

    while (start <= end) {
      slots.push(start.format("HH:mm"));
      start.add(30, "minutes");
    }
  }, []);

  // Hiển thị chi tiết đặt bàn
  return (
    <div>
      <Descriptions
        title={
          <Space>
            <span>Thông tin đặt bàn</span>
            <Badge
              status={
                reservation.status === "pending"
                  ? "processing"
                  : reservation.status === "confirmed"
                  ? "success"
                  : reservation.status === "completed"
                  ? "default"
                  : "error"
              }
              text={statusText[reservation.status] || reservation.status}
            />
          </Space>
        }
        bordered
        column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
      >
        <Descriptions.Item label="Mã đặt bàn">{reservation.id?.substring(0, 8).toUpperCase() || ""}</Descriptions.Item>

        <Descriptions.Item label="Trạng thái">
          <Tag color={statusColors[reservation.status] || "default"}>
            {statusText[reservation.status] || reservation.status}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Khách hàng">{reservation.customer?.full_name || "Không xác định"}</Descriptions.Item>

        <Descriptions.Item label="Số điện thoại">{reservation.phone || ""}</Descriptions.Item>

        <Descriptions.Item label="Ngày đặt">
          {reservation.reservation_time ? moment(reservation.reservation_time).format("DD/MM/YYYY") : ""}
        </Descriptions.Item>

        <Descriptions.Item label="Giờ đặt">{reservation.timeSlot || ""}</Descriptions.Item>

        <Descriptions.Item label="Số người">{reservation.number_of_people || 1}</Descriptions.Item>

        <Descriptions.Item label="Bàn">
          {reservation.table?.name || "Chưa xác định"}{" "}
          {reservation.table?.capacity ? `(${reservation.table.capacity} người)` : ""}
        </Descriptions.Item>

        <Descriptions.Item label="Nhà hàng">{reservation.restaurant?.name || "Không xác định"}</Descriptions.Item>

        <Descriptions.Item label="Địa chỉ nhà hàng">
          {reservation.restaurant.address || "Không xác định"}
        </Descriptions.Item>
      </Descriptions>

      {/* Hiển thị lịch sử thay đổi */}
      <Divider orientation="left">Lịch sử đặt bàn</Divider>
      <Timeline mode="left">
        {reservationHistory.map((item, index) => (
          <Timeline.Item
            key={index}
            color={statusColors[item.status] || "blue"}
            label={moment(item.timestamp).format("DD/MM/YYYY HH:mm")}
            dot={statusIcon[item.status]}
          >
            {item.action}
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  );
};

export default AdminReservationDetail;
