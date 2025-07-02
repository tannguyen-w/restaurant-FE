import { useState, useEffect } from "react";
import { Modal, Form, InputNumber, Select, Button, Row, Col, Divider, Typography, Spin, message } from "antd";
import { createInvoice } from "../../../services/invoiceService";
import { updateOrderStatus } from "../../../services/orderService";
import { getOrderDetailById } from "../../../services/orderDetailService";

const { Text } = Typography;
const { Option } = Select;

const PaymentModal = ({ visible, order, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);

  useEffect(() => {
    if (visible && order) {
      fetchOrderDetails(order.id);
    }
  }, [visible, order]);

  const fetchOrderDetails = async (orderId) => {
    setLoading(true);
    try {
      const response = await getOrderDetailById(orderId);

      // Đặt tổng tiền từ response.total
      setTotalAmount(response.total || 0);

      // Cập nhật state cho danh sách sản phẩm
      const orderItemsData = response.data || [];

      // Cập nhật order object với thông tin orderItems mới
      if (order) {
        order.orderItems = orderItemsData;
      }

      // Reset form với giá trị mới
      form.setFieldsValue({
        totalAmount: response.total || 0,
        discount: 0,
        finalAmount: response.total || 0,
        paymentMethod: "cash",
      });

      // Đặt finalAmount để khớp với tổng tiền
      setFinalAmount(response.total || 0);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết đơn hàng:", error);
      message.error("Không thể tải thông tin chi tiết đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // Tính lại số tiền cuối cùng khi discount thay đổi
  const handleDiscountChange = (value) => {
    const discountValue = value || 0;
    setDiscount(discountValue);
    const final = Math.max(0, totalAmount - discountValue); // Sửa từ discount thành discountValue
    setFinalAmount(final);
    form.setFieldsValue({ finalAmount: final }); // Sửa từ finalAmount thành final
  };

  // Xử lý thanh toán
  const handleConfirmPayment = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Log dữ liệu trước khi gửi request để kiểm tra
      console.log("Dữ liệu thanh toán:", {
        order: order.id,
        discount: values.discount,
        payment_method: values.paymentMethod,
      });

      // Tạo hóa đơn
      await createInvoice({
        order: order.id,
        discount: values.discount,
        payment_method: values.paymentMethod,
      });

      // Đối với đơn dine-in, chuyển sang trạng thái "finished"
      if (order.orderType === "dine-in") {
        await updateOrderStatus(order.id, "finished");
      }

      message.success("Thanh toán thành công!");
      onSuccess && onSuccess(order.id);
    } catch (error) {
      console.error("Thanh toán thất bại:", error);
      message.error("Thanh toán thất bại: " + (error.message || "Lỗi không xác định"));
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return null;
  }

  return (
    <Modal title="Thanh toán đơn hàng" open={visible} onCancel={onClose} footer={null} width={600} destroyOnClose>
      <Spin spinning={loading}>
        <div style={{ marginBottom: 16 }}>
          <Row>
            <Col span={12}>
              <Text strong>Mã đơn hàng:</Text> {order.id?.substring(0, 8).toUpperCase()}
            </Col>
            <Col span={12}>
              <Text strong>Khách hàng:</Text> {order.fullName || "Không có thông tin"}
            </Col>
          </Row>
          <Row style={{ marginTop: 8 }}>
            <Col span={12}>
              <Text strong>Loại đơn:</Text> {order.orderType === "dine-in" ? "Tại bàn" : "Online"}
            </Col>
            <Col span={12}>
              <Text strong>Bàn:</Text> {order.table?.name || "Không xác định"}
            </Col>
          </Row>
        </div>

        <Divider orientation="left">Chi tiết đơn hàng</Divider>

        <div style={{ maxHeight: "200px", overflowY: "auto", marginBottom: 16 }}>
          {order.orderItems?.length > 0 ? (
            order.orderItems.map((item, index) => (
              <Row key={index} style={{ marginBottom: 8 }}>
                <Col span={12}>
                  {item.dish?.name || "Không xác định"} x{item.quantity}
                </Col>
                <Col span={12} style={{ textAlign: "right" }}>
                  {((item.price || item.dish.price || 0) * item.quantity).toLocaleString()}đ
                </Col>
              </Row>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "20px" }}>
              {loading ? <Spin size="small" /> : "Không có dữ liệu chi tiết"}
            </div>
          )}
        </div>

        <Form form={form} layout="vertical" initialValues={{ paymentMethod: "cash" }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="totalAmount" label="Tổng tiền">
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  disabled
                  addonAfter="đ"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="discount" label="Giảm giá">
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  onChange={handleDiscountChange}
                  addonAfter="đ"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="finalAmount" label="Số tiền thanh toán">
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  disabled
                  addonAfter="đ"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="paymentMethod"
                label="Phương thức thanh toán"
                rules={[{ required: true, message: "Vui lòng chọn phương thức thanh toán" }]}
              >
                <Select>
                  <Option value="cash">Tiền mặt</Option>
                  <Option value="card">Thẻ ngân hàng</Option>
                  <Option value="transfer">Chuyển khoản</Option>
                  <Option value="momo">Ví MoMo</Option>
                  <Option value="vnpay">VNPay</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <div style={{ marginTop: 24, textAlign: "right" }}>
            <Button onClick={onClose} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" onClick={handleConfirmPayment} loading={loading}>
              Xác nhận thanh toán
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};

export default PaymentModal;
