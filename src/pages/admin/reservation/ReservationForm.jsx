import { useState, useEffect } from "react";
import { Modal, Form, Input, Select, DatePicker, InputNumber, Button, Row, Col, Tag, message } from "antd";
import moment from "moment";
import { getTablesByRestaurant } from "../../../services/tableService";
import { createReservation, updateReservation } from "../../../services/reservationService";

const { Option } = Select;

const statusColors = {
  pending: "gold",
  confirmed: "blue",
  completed: "green",
  cancelled: "red",
};

const timeSlots = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

const ReservationForm = ({
  visible,
  onCancel,
  onSuccess,
  reservation = null,
  restaurants = [],
  userRole,
  userRestaurantId,
  userName,
}) => {
  const [form] = Form.useForm();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [peopleCount, setPeopleCount] = useState(1);

  const isEditMode = !!reservation;
  const isAdmin = userRole === "admin";
  const isManager = userRole === "manager";

  // Khởi tạo form khi mở modal
  useEffect(() => {
    if (visible) {
      form.resetFields();
      setPeopleCount(reservation?.number_of_people || 1);

      if (isEditMode) {
        // Điền dữ liệu cho trường hợp chỉnh sửa
        form.setFieldsValue({
          phone: reservation.phone || "",
          number_of_people: reservation.number_of_people || 1,
          table: reservation.table?.id,
          date: reservation.reservation_time ? moment(reservation.reservation_time) : null,
          timeSlot: reservation.timeSlot || "",
          status: reservation.status || "pending",
          restaurant: reservation.restaurant?.id || userRestaurantId,
        });

        // Tải danh sách bàn
        fetchTablesByRestaurantId(reservation.restaurant?.id || userRestaurantId);
      } else {
        // Khởi tạo giá trị mặc định cho thêm mới
        form.setFieldsValue({
          number_of_people: 1,
          status: "pending",
          date: moment(),
          restaurant: userRestaurantId,
        });

        // Tải danh sách bàn
        if (userRestaurantId) {
          fetchTablesByRestaurantId(userRestaurantId);
        }
      }
    }
  }, [visible, reservation, form, isEditMode, userRestaurantId]);

  // Tải danh sách bàn theo nhà hàng
  const fetchTablesByRestaurantId = async (restaurantId) => {
    if (!restaurantId) return;

    try {
      setLoading(true);
      const response = await getTablesByRestaurant(restaurantId);
      setTables(response.results || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách bàn:", error);
      message.error("Không thể tải danh sách bàn");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi nhà hàng thay đổi
  const handleRestaurantChange = (restaurantId) => {
    form.setFieldsValue({
      restaurant: restaurantId, // Cập nhật ID nhà hàng
      table: undefined, // Reset giá trị bàn
    });
    fetchTablesByRestaurantId(restaurantId);
  };

  // Xử lý khi ngày đặt thay đổi
  const handleDateChange = (date) => {
    form.setFieldValue("date", date);
    const restaurantId = form.getFieldValue("restaurantId") || userRestaurantId;

    if (restaurantId) {
      fetchTablesByRestaurantId(restaurantId);
    }
  };

  // Xử lý khi số người thay đổi
  const handlePeopleCountChange = (value) => {
    setPeopleCount(value);

    // Kiểm tra nếu bàn đã chọn không đủ chỗ cho số người mới
    const selectedTableId = form.getFieldValue("table");
    const selectedTable = tables.find((t) => t.id === selectedTableId);
    if (selectedTable && selectedTable.capacity < value) {
      form.setFieldValue("table", undefined);
      message.info("Bàn đã chọn không đủ chỗ cho số người mới, vui lòng chọn bàn khác");
    }
  };

  // Xử lý submit form
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const formData = {
        customer: userName,
        phone: values.phone,
        number_of_people: values.number_of_people,
        table: values.table,
        reservation_time: values.date.format("YYYY-MM-DD"),
        timeSlot: values.timeSlot,
        status: values.status,
        restaurant: values.restaurant || userRestaurantId,
      };

      if (isEditMode) {
        // Cập nhật đặt bàn
        await updateReservation(reservation.id, formData);
        message.success("Cập nhật đặt bàn thành công");
      } else {
        // Thêm mới đặt bàn
        await createReservation(formData);
        message.success("Thêm mới đặt bàn thành công");
      }

      onCancel(); // Đóng modal
      onSuccess(); // Gọi callback để refresh dữ liệu
    } catch (error) {
      console.error("Lỗi khi lưu đặt bàn:", error);
      message.error("Không thể lưu thông tin đặt bàn");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEditMode ? "Chỉnh sửa thông tin đặt bàn" : "Thêm đặt bàn mới"}
      open={visible}
      onCancel={onCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          {isEditMode ? "Cập nhật" : "Thêm mới"}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        {isAdmin && (
          <Form.Item
            name="restaurant"
            label="Nhà hàng"
            rules={[{ required: true, message: "Vui lòng chọn nhà hàng!" }]}
          >
            <Select placeholder="Chọn nhà hàng" onChange={handleRestaurantChange} disabled={isManager}>
              {restaurants.map((restaurant) => (
                <Option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item
          name="phone"
          label="Số điện thoại"
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
        >
          <Input />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="number_of_people"
              label="Số người"
              rules={[{ required: true, message: "Vui lòng nhập số người!" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} onChange={handlePeopleCountChange} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select>
                <Option value="pending">
                  <Tag color={statusColors.pending}>Đang chờ</Tag>
                </Option>
                <Option value="confirmed">
                  <Tag color={statusColors.confirmed}>Đã xác nhận</Tag>
                </Option>
                <Option value="completed">
                  <Tag color={statusColors.completed}>Hoàn thành</Tag>
                </Option>
                <Option value="cancelled">
                  <Tag color={statusColors.cancelled}>Đã hủy</Tag>
                </Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="date" label="Ngày đặt" rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}>
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" onChange={handleDateChange} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="timeSlot" label="Giờ đặt" rules={[{ required: true, message: "Vui lòng chọn giờ!" }]}>
              <Select placeholder="Chọn giờ">
                {timeSlots.map((slot) => (
                  <Option key={slot} value={slot}>
                    {slot}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="table"
          label="Bàn"
          rules={[{ required: true, message: "Vui lòng chọn bàn!" }]}
          extra={tables.length === 0 ? "Vui lòng chọn nhà hàng và ngày trước" : null}
        >
          <Select
            placeholder="Chọn bàn"
            disabled={tables.length === 0 || loading}
            loading={loading}
            notFoundContent={loading ? "Đang tải..." : tables.length === 0 ? "Không có bàn trống" : null}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          >
            {tables
              .filter((table) => table.capacity >= peopleCount)
              .map((table) => (
                <Option key={table.id} value={table.id}>
                  {table.name} (Sức chứa: {table.capacity} người)
                </Option>
              ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReservationForm;
