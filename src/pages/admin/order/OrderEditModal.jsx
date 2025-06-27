import { Modal, Form, Input, Select, DatePicker, InputNumber, Button, Table, message, Divider } from "antd";
import { useState, useEffect } from "react";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  getOrderDetailById,
  updateOrderDetail,
  deleteOrderDetail,
  createOrderDetail,
} from "../../../services/orderDetailService";
import { updateOrder } from "../../../services/orderService";
import { getDishesByRestaurant } from "../../../services/dishService";
import { getTablesByRestaurant } from "../../../services/tableService";
import moment from "moment";

const { Option } = Select;

const OrderEditModal = ({ visible, order, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dishes, setDishes] = useState([]);
  const [tables, setTables] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  // Lấy dữ liệu ban đầu khi modal hiển thị
  useEffect(() => {
    if (visible && order) {
      fetchInitialData();
      fetchOrderDetails();
    }
  }, [visible, order]);

  // Tính toán tổng tiền khi orderItems thay đổi
  useEffect(() => {
    const total = orderItems.reduce((sum, item) => {
      return sum + (item.dish?.price || 0) * (item.quantity || 0);
    }, 0);
    setTotalAmount(total);
  }, [orderItems]);

  // Lấy dữ liệu ban đầu
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Lấy danh sách món ăn
      const dishesResponse = await getDishesByRestaurant(order.table.restaurant?.id);
      setDishes(dishesResponse.results || []);

      // Lấy danh sách bàn
      const tablesResponse = await getTablesByRestaurant(order.table.restaurant?.id);
      setTables(tablesResponse.results || []);

      // Set giá trị mặc định cho form
      form.setFieldsValue({
        fullName: order.fullName || "",
        orderType: order.orderType || "dine-in",
        tableId: order.table?.id || null,
        status: order.status || "pending",
        orderDate: order.orderTime ? moment(order.orderTime) : moment(),
      });
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu ban đầu:", error);
      message.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Lấy chi tiết đơn hàng
  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await getOrderDetailById(order.id);
      setOrderItems(response.data || []);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết đơn hàng:", error);
      message.error("Không thể tải chi tiết đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // Thêm món ăn mới
  const handleAddItem = () => {
    // Kiểm tra xem có món nào chưa chọn dish không
    const hasEmptyDish = orderItems.some((item) => !item.dish);

    if (hasEmptyDish) {
      message.warning("Vui lòng chọn món ăn cho các hàng hiện tại trước khi thêm mới");
      return;
    }

    // Kiểm tra nếu đã hết món để chọn
    const selectedDishIds = orderItems.map((item) => item.dish?.id).filter(Boolean);
    const remainingDishes = dishes.filter((dish) => !selectedDishIds.includes(dish.id));

    if (remainingDishes.length === 0) {
      message.warning("Đã thêm tất cả các món ăn hiện có");
      return;
    }

    setOrderItems([
      ...orderItems,
      {
        id: `temp-${Date.now()}`, // ID tạm thời cho món mới
        dish: null,
        quantity: 1,
        isNew: true, // Đánh dấu là món mới
      },
    ]);
  };

  // Cập nhật số lượng món ăn
  const handleQuantityChange = (id, value) => {
    setOrderItems(orderItems.map((item) => (item.id === id ? { ...item, quantity: value } : item)));
  };

  // Xóa món ăn
  const handleRemoveItem = (id) => {
    setOrderItems(orderItems.filter((item) => item.id !== id));
  };

  // Cập nhật món ăn
  const handleDishChange = (id, dishId) => {
    const selectedDish = dishes.find((dish) => dish.id === dishId);

    // Kiểm tra xem món ăn đã tồn tại trong danh sách chưa
    const isDishAlreadyAdded = orderItems.some((item) => item.id !== id && item.dish?.id === dishId);

    if (isDishAlreadyAdded) {
      message.warning(`Món ${selectedDish.name} đã tồn tại trong đơn hàng, vui lòng điều chỉnh số lượng`);
      return;
    }

    setOrderItems(
      orderItems.map((item) => (item.id === id ? { ...item, dish: selectedDish, isModified: true } : item))
    );
  };

  // Lưu thay đổi đơn hàng
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Kiểm tra nếu không có món ăn nào
      if (orderItems.length === 0) {
        message.error("Vui lòng thêm ít nhất một món ăn");
        setLoading(false);
        return;
      }

      // Cập nhật thông tin đơn hàng
      await updateOrder(order.id, {
        fullName: values.fullName,
        orderType: values.orderType,
        table: values.tableId,
        status: values.status,
        orderTime: values.orderDate.format("YYYY-MM-DD HH:mm:ss"),
      });

      // Cập nhật trạng thái đơn hàng nếu thay đổi
      if (values.status !== order.status) {
        await updateOrder(order.id, values.status);
      }

      // Xử lý các món ăn trong đơn hàng
      for (const item of orderItems) {
        if (item.isNew) {
          // Thêm mới món ăn
          await createOrderDetail({
            order: order.id,
            dish: item.dish.id,
            quantity: item.quantity,
          });
        } else if (item.isModified) {
          // Cập nhật món ăn đã thay đổi
          await updateOrderDetail(item.id, {
            quantity: item.quantity,
          });
        }
      }

      // Xóa món ăn đã bị loại bỏ (nếu có)
      const originalItems = await getOrderDetailById(order.id);
      const currentItemIds = orderItems.map((item) => item.id);

      for (const originalItem of originalItems.items || []) {
        if (!currentItemIds.includes(originalItem.id) && !originalItem.id.startsWith("temp-")) {
          await deleteOrderDetail(originalItem.id);
        }
      }

      message.success("Cập nhật đơn hàng thành công");
      onSuccess();
    } catch (error) {
      console.error("Lỗi khi cập nhật đơn hàng:", error);
      message.error("Không thể cập nhật đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Chỉnh sửa đơn hàng #${order?.id?.substring(0, 8).toUpperCase() || ""}`}
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button key="save" type="primary" loading={loading} onClick={handleSave}>
          Lưu
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="fullName"
          label="Tên khách hàng"
          rules={[{ required: true, message: "Vui lòng nhập tên khách hàng" }]}
        >
          <Input placeholder="Nhập tên khách hàng" />
        </Form.Item>

        <Form.Item
          name="orderDate"
          label="Thời gian đặt"
          rules={[{ required: true, message: "Vui lòng chọn thời gian đặt" }]}
        >
          <DatePicker showTime={{ format: "HH:mm" }} format="DD/MM/YYYY HH:mm" style={{ width: "100%" }} />
        </Form.Item>

        <div style={{ display: "flex", gap: "16px" }}>
          <Form.Item
            name="orderType"
            label="Loại đơn"
            rules={[{ required: true, message: "Vui lòng chọn loại đơn" }]}
            style={{ flex: 1 }}
          >
            <Select placeholder="Chọn loại đơn">
              <Option value="dine-in">Tại bàn</Option>
              <Option value="online">Online</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="tableId"
            label="Bàn"
            rules={[{ required: true, message: "Vui lòng chọn bàn" }]}
            style={{ flex: 1 }}
          >
            <Select placeholder="Chọn bàn">
              {tables.map((table) => (
                <Option key={table.id} value={table.id}>
                  {table.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
            style={{ flex: 1 }}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="pending">Đang chờ</Option>
              <Option value="preparing">Đang chuẩn bị</Option>
              <Option value="served">Đã phục vụ</Option>
              <Option value="finished">Hoàn thành</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
          </Form.Item>
        </div>

        <Divider orientation="left">Chi tiết món ăn</Divider>

        <Table
          dataSource={orderItems}
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: "Món ăn",
              dataIndex: "dish",
              key: "dish",
              render: (dish, record) => {
                // Lấy danh sách ID các món ăn đã được chọn (trừ món hiện tại)
                const selectedDishIds = orderItems
                  .filter((item) => item.id !== record.id && item.dish?.id)
                  .map((item) => item.dish?.id);

                // Lọc danh sách món ăn để loại bỏ những món đã chọn
                const availableDishes = dishes.filter((dish) => !selectedDishIds.includes(dish.id));

                // Nếu món ăn hiện tại đã được chọn, thêm vào danh sách có thể chọn
                if (dish?.id && !availableDishes.some((d) => d.id === dish.id)) {
                  availableDishes.push(dish);
                }

                return (
                  <Select
                    style={{ width: "100%" }}
                    placeholder="Chọn món ăn"
                    value={dish?.id || null}
                    onChange={(value) => handleDishChange(record.id, value)}
                    notFoundContent="Không có món ăn phù hợp"
                  >
                    {availableDishes.map((dish) => (
                      <Option key={dish.id} value={dish.id}>
                        {dish.name} - {dish.price?.toLocaleString() || 0} đ
                      </Option>
                    ))}
                  </Select>
                );
              },
            },
            {
              title: "Số lượng",
              dataIndex: "quantity",
              key: "quantity",
              width: 100,
              render: (quantity, record) => (
                <InputNumber
                  min={1}
                  defaultValue={quantity || 1}
                  onChange={(value) => handleQuantityChange(record.id, value)}
                  style={{ width: "100%" }}
                />
              ),
            },
            {
              title: "Đơn giá",
              dataIndex: ["dish", "price"],
              key: "price",
              width: 150,
              render: (price) => `${price?.toLocaleString() || 0} đ`,
            },
            {
              title: "Thành tiền",
              key: "total",
              width: 150,
              render: (_, record) => `${((record.dish?.price || 0) * (record.quantity || 0)).toLocaleString()} đ`,
            },
            {
              title: "Thao tác",
              key: "action",
              width: 80,
              render: (_, record) => (
                <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => handleRemoveItem(record.id)} />
              ),
            },
          ]}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3} align="right">
                  <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddItem}>
                    Thêm món
                  </Button>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <strong>Tổng tiền:</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  <strong>{totalAmount?.toLocaleString() || 0} đ</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Form>
    </Modal>
  );
};

export default OrderEditModal;
