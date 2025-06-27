import { Modal, Form, Input, Select, DatePicker, InputNumber, Button, Table, message, Divider } from "antd";
import { useState, useEffect } from "react";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { createOrder } from "../../../services/orderService";
import { createOrderDetail } from "../../../services/orderDetailService";
import { getDishesByRestaurant } from "../../../services/dishService";
import { getTablesByRestaurant } from "../../../services/tableService";
import { getCustomers } from "../../../services/userServices";
import { getRestaurants } from "../../../services/restaurantServices";
import { useAuth } from "../../../components/context/authContext";
import moment from "moment";

const { Option } = Select;

const OrderAddModal = ({ visible, onClose, onSuccess, restaurantId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dishes, setDishes] = useState([]);
  const [tables, setTables] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const { user } = useAuth();

  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(restaurantId || user?.restaurant?.id);

  // Lấy dữ liệu ban đầu khi modal hiển thị
  useEffect(() => {
    if (visible) {
      fetchInitialData();
      // Khởi tạo ít nhất một món khi mở modal
      setOrderItems([
        {
          id: `temp-${Date.now()}`,
          dish: null,
          quantity: 1,
        },
      ]);

      // Reset form
      form.setFieldsValue({
        restaurantId: restaurantId || user?.restaurant?.id,
        fullName: "",
        orderType: "dine-in",
        tableId: null,
        customerId: null,
        orderDate: moment(),
      });
    }
  }, [visible, restaurantId]);

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
      // Sử dụng restaurantId được truyền từ component cha
      const effectiveRestaurantId = restaurantId || user?.restaurant?.id;
      setSelectedRestaurantId(effectiveRestaurantId);

      // Nếu là admin, lấy danh sách tất cả nhà hàng
      if (user?.role?.name === "admin") {
        const restaurantsResponse = await getRestaurants();
        setRestaurants(restaurantsResponse.results || []);
      }

      // Chỉ tải danh sách bàn nếu đã có nhà hàng được chọn
      if (effectiveRestaurantId) {
        await fetchTablesByRestaurant(effectiveRestaurantId);
        await fetchDishesByRestaurant(effectiveRestaurantId);
      }

      // Lấy danh sách khách hàng
      const customersResponse = await getCustomers();
      setCustomers(customersResponse || []);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu ban đầu:", error);
      message.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm lấy bàn theo nhà hàng
  const fetchTablesByRestaurant = async (restaurantId) => {
    if (!restaurantId) return;

    try {
      const tablesResponse = await getTablesByRestaurant(restaurantId);
      setTables(tablesResponse.results || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách bàn:", error);
      message.error("Không thể tải danh sách bàn");
    }
  };

  // Thêm hàm lấy món ăn theo nhà hàng
  const fetchDishesByRestaurant = async (restaurantId) => {
    if (!restaurantId) return;

    try {
      const dishesResponse = await getDishesByRestaurant(restaurantId);
      setDishes(dishesResponse.results || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách món ăn:", error);
      message.error("Không thể tải danh sách món ăn");
    }
  };

  // Thêm hàm xử lý khi thay đổi nhà hàng
  const handleRestaurantChange = async (restaurantId) => {
    setSelectedRestaurantId(restaurantId);

    // Reset form fields liên quan
    form.setFieldsValue({
      tableId: undefined,
    });

    // Reset danh sách bàn và món ăn
    setTables([]);
    setDishes([]);

    // Lấy danh sách bàn và món ăn mới theo nhà hàng
    await fetchTablesByRestaurant(restaurantId);
    await fetchDishesByRestaurant(restaurantId);

    // Reset các món đã chọn vì món ăn có thể thay đổi theo nhà hàng
    setOrderItems([
      {
        id: `temp-${Date.now()}`,
        dish: null,
        quantity: 1,
      },
    ]);
  };

  // Cập nhật số lượng món ăn
  const handleQuantityChange = (id, value) => {
    setOrderItems(orderItems.map((item) => (item.id === id ? { ...item, quantity: value } : item)));
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

    setOrderItems(orderItems.map((item) => (item.id === id ? { ...item, dish: selectedDish } : item)));
  };

  // Xóa món ăn
  const handleRemoveItem = (id) => {
    if (orderItems.length === 1) {
      message.warning("Đơn hàng cần có ít nhất một món");
      return;
    }
    setOrderItems(orderItems.filter((item) => item.id !== id));
  };

  // Xử lý khi khách hàng được chọn
  const handleCustomerChange = (customerId) => {
    if (!customerId) return;

    const selectedCustomer = customers.find((c) => c.id === customerId);
    if (selectedCustomer) {
      form.setFieldsValue({
        fullName: selectedCustomer.full_name || "",
      });
    }
  };

  // Lưu đơn hàng mới
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Kiểm tra nếu có món nào chưa chọn
      const hasEmptyDish = orderItems.some((item) => !item.dish);
      if (hasEmptyDish) {
        message.error("Vui lòng chọn món ăn cho tất cả các hàng");
        setLoading(false);
        return;
      }

      // Kiểm tra nếu không có món ăn nào hợp lệ
      const validItems = orderItems.filter((item) => item.dish && item.quantity > 0);
      if (validItems.length === 0) {
        message.error("Vui lòng thêm ít nhất một món ăn hợp lệ");
        setLoading(false);
        return;
      }

      // Tạo đơn hàng mới
      const newOrderData = {
        fullName: values.fullName,
        orderType: values.orderType,
        table: values.tableId,
        customer: values.customerId, // Có thể null
        restaurant: restaurantId || selectedRestaurantId,
        orderTime: values.orderDate.format("YYYY-MM-DD HH:mm:ss"),
        status: "pending",
      };

      const orderResponse = await createOrder(newOrderData);
      const orderId = orderResponse.id;

      // Thêm các món ăn vào đơn hàng
      await Promise.all(
        validItems.map((item) =>
          createOrderDetail({
            order: orderId,
            dish: item.dish.id,
            quantity: item.quantity,
          })
        )
      );

      message.success("Tạo đơn hàng thành công");
      onSuccess();
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      message.error("Không thể tạo đơn hàng");
    } finally {
      setLoading(false);
    }
  };

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
        id: `temp-${Date.now()}`,
        dish: null,
        quantity: 1,
      },
    ]);
  };

  return (
    <Modal
      title="Thêm đơn hàng mới"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button key="save" type="primary" loading={loading} onClick={handleSave}>
          Tạo đơn
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        {user?.role?.name === "admin" && (
          <Form.Item
            name="restaurantId"
            label="Nhà hàng"
            rules={[{ required: true, message: "Vui lòng chọn nhà hàng" }]}
          >
            <Select
              placeholder="Chọn nhà hàng"
              onChange={handleRestaurantChange}
              value={selectedRestaurantId}
              disabled={loading}
            >
              {restaurants.map((restaurant) => (
                <Option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <div style={{ display: "flex", gap: "16px" }}>
          <Form.Item name="customerId" label="Khách hàng đăng ký" style={{ flex: 1 }}>
            <Select
              placeholder="Chọn khách hàng"
              allowClear
              showSearch
              filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
              onChange={handleCustomerChange}
            >
              {customers.map((customer) => (
                <Option key={customer.id} value={customer.id}>
                  {customer.full_name || customer.username}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Tên khách hàng"
            rules={[{ required: true, message: "Vui lòng nhập tên khách hàng" }]}
            style={{ flex: 2 }}
          >
            <Input placeholder="Nhập tên khách hàng" />
          </Form.Item>
        </div>

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

export default OrderAddModal;
