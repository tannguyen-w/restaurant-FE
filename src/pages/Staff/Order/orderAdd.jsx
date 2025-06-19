import { useEffect, useState } from "react";
import { Form, Input, Button, Select, message } from "antd";
import { getTablesByRestaurant } from "../../../services/tableService";
import { createOrder } from "../../../services/orderService";
import { getCustomers } from "../../../services/userServices";
import { useAuth } from "../../../components/context/authContext";
import { useNavigate } from "react-router-dom";

const OrderAdd = () => {
  const [tables, setTables] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getTablesByRestaurant(user.restaurant.id).then((res) => setTables(res.results || []));
    getCustomers().then((res) => setCustomers(res || []));
  }, [user.restaurant.id]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await createOrder({
        ...values,
        restaurant: user.restaurant.id,
        status: "pending",
        orderTime: new Date(),
      });
      
      message.success("Tạo đơn hàng thành công!");
      form.resetFields();
      setTimeout(() => {
        navigate("/staff/order");
      }, 500);
    } catch {
      message.error("Tạo đơn hàng thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="staff-content__header">Thêm mới đơn hàng</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: 500, background: "#fff", padding: 24, borderRadius: 8 }}
      >
        <Form.Item name="orderType" label="Loại đơn" rules={[{ required: true, message: "Chọn loại đơn" }]}>
          <Select placeholder="Chọn loại đơn">
            <Select.Option value="dine-in">Tại bàn</Select.Option>
            <Select.Option value="online">Online</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="customer" label="Khách hàng">
          <Select
            showSearch
            placeholder="Chọn khách hàng"
            optionFilterProp="children"
            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
            allowClear
          >
            {customers.map((cus) => (
              <Select.Option key={cus.id} value={cus.id}>
                {cus.full_name} - {cus.username}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="table" label="Bàn" rules={[{ required: true, message: "Chọn bàn" }]}>
          <Select
            showSearch
            placeholder="Chọn bàn"
            optionFilterProp="children"
            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
          >
            {tables.map((table) => (
              <Select.Option key={table.id || table._id} value={table.id || table._id}>
                {table.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="fullName" label="Tên khách" rules={[{ required: true, message: "Nhập tên khách" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="phone" label="SĐT" rules={[{ required: true, message: "Nhập SĐT" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="address" label="Địa chỉ">
          <Input />
        </Form.Item>
        <Form.Item name="note" label="Ghi chú">
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Thêm mới
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default OrderAdd;
