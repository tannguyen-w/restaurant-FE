import { Modal, Descriptions, Table, Tag, Button, Divider } from "antd";
import { useState, useEffect } from "react";
import { getOrderDetailById } from "../../../services/orderDetailService";
import { PrinterOutlined } from "@ant-design/icons";
import moment from "moment";

// Định nghĩa màu cho các trạng thái
const statusColors = {
  pending: "gold",
  preparing: "blue",
  served: "cyan",
  finished: "green",
  cancelled: "red",
};

// Định nghĩa text hiển thị cho các trạng thái
const statusText = {
  pending: "Đang chờ",
  preparing: "Đang chuẩn bị",
  served: "Đã phục vụ",
  finished: "Hoàn thành",
  cancelled: "Đã hủy",
};

// Định nghĩa text hiển thị cho loại đơn hàng
const orderTypeText = {
  "dine-in": "Tại bàn",
  online: "Online",
};

const OrderDetailModal = ({ visible, order, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (visible && order) {
      fetchOrderDetails(order.id);
    }
  }, [visible, order]);

  const fetchOrderDetails = async (orderId) => {
    setLoading(true);
    try {
      const response = await getOrderDetailById(orderId);
      setOrderDetails(response.data || []);
      setTotalAmount(response.total || 0);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("order-details-print");
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  if (!order) return null;

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên món",
      dataIndex: ["dish", "name"],
      key: "name",
    },
    {
      title: "Đơn giá",
      dataIndex: ["dish", "price"],
      key: "price",
      render: (price) => `${price?.toLocaleString() || 0} đ`,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Thành tiền",
      key: "total",
      render: (_, record) => `${(record.dish?.price * record.quantity)?.toLocaleString() || 0} đ`,
    },
  ];

  return (
    <Modal
      title={`Chi tiết đơn hàng #${order.id?.substring(0, 8).toUpperCase() || ""}`}
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
        <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
          In hóa đơn
        </Button>,
      ]}
    >
      <div id="order-details-print">
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Mã đơn hàng" span={2}>
            {order.id?.substring(0, 8).toUpperCase() || ""}
          </Descriptions.Item>
          <Descriptions.Item label="Tên khách">{order.fullName || "Không có thông tin"}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={statusColors[order.status] || "default"}>{statusText[order.status] || order.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Loại đơn">{orderTypeText[order.orderType] || order.orderType}</Descriptions.Item>
          <Descriptions.Item label="Bàn">{order.table?.name || "Không xác định"}</Descriptions.Item>
          <Descriptions.Item label="Nhà hàng" span={2}>
            {order.table.restaurant?.name || "Không xác định"}
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian đặt" span={2}>
            {moment(order.orderTime).format("DD/MM/YYYY HH:mm:ss")}
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">Chi tiết món ăn</Divider>

        <Table
          columns={columns}
          dataSource={orderDetails}
          rowKey="id"
          pagination={false}
          loading={loading}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4} align="right">
                  <strong>Tổng tiền:</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <strong>{totalAmount?.toLocaleString() || 0} đ</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </div>
    </Modal>
  );
};

export default OrderDetailModal;
