import { getCustomers } from "../../../services/userServices";
import { getTablesByRestaurant } from "../../../services/tableService";
import { createReservation } from "../../../services/reservationService";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
} from "antd";
import { PhoneOutlined, TeamOutlined } from "@ant-design/icons";
import { useAuth } from "../../../components/context/authContext";
import moment from "moment";

const { Option } = Select;

const ReservationAdd = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  // Khởi tạo các time slots từ 8:00 đến 22:00
  useEffect(() => {
    const slots = [];
    const start = moment().startOf('day').add(10, 'hours'); // 8:00 AM
    const end = moment().startOf('day').add(20, 'hours'); // 10:00 PM
    
    while (start <= end) {
      slots.push(start.format('HH:mm'));
      start.add(30, 'minutes');
    }
    setTimeSlots(slots);
  }, []);

  // Load bàn và khách hàng khi component mount
  useEffect(() => {

    const params = {
    limit: 500
  };
    getTablesByRestaurant(user.restaurant.id, params).then((res) => {
      setTables(res.results || []);
      setAvailableTables(res.results || []);
    });
    getCustomers().then((res) => setCustomers(res || []));
    
  }, [user.restaurant.id]);

  // Kiểm tra và cập nhật danh sách bàn có sẵn khi ngày hoặc giờ thay đổi
  useEffect(() => {
    if (selectedDate && selectedTimeSlot) {
      checkAvailableTables(selectedDate, selectedTimeSlot);
    }
  }, [selectedDate, selectedTimeSlot]);

  // Hàm xử lý khi thay đổi ngày đặt
  const handleDateChange = (date) => {
    setSelectedDate(date);
    form.setFieldsValue({ table: undefined }); // Reset selected table
  };

  // Hàm xử lý khi thay đổi time slot
  const handleTimeSlotChange = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    form.setFieldsValue({ table: undefined }); // Reset selected table
  };

  // Hàm kiểm tra bàn có sẵn dựa trên ngày và giờ đặt
  const checkAvailableTables = async (date, timeSlot) => {
    if (!date || !timeSlot) return;
    
    try {
      setLoading(true);
      
      // Ở đây bạn cần gọi API để kiểm tra bàn có sẵn
      // Đây là mô phỏng - trong thực tế nên có API riêng cho việc này
      // const response = await checkAvailableTablesAPI(date.format('YYYY-MM-DD'), timeSlot, user.restaurant.id);
      
      // Giả lập kết quả trả về - trong thực tế kết quả sẽ được trả về từ API
      // Hiện tại chỉ hiển thị tất cả bàn - bạn nên thay thế bằng logic thực tế
      setAvailableTables(tables); 
      
      setLoading(false);
    } catch (error) {
      console.error("Failed to check available tables:", error);
      message.error("Không thể kiểm tra bàn trống. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  // Xử lý submit form
  const onFinish = async (values) => {
    try {
      setLoading(true);

      // Format reservation time
      const date = values.reservationDate.format("YYYY-MM-DD");
      const time = values.timeSlot;
      const reservationTime = moment(`${date} ${time}`).toISOString();

      // Create reservation data
      const reservationData = {
        customer: values.customer,
        table: values.table,
        restaurant: values.table
          ? tables.find((t) => t.id === values.table)?.restaurant
          : user.restaurant.id, // Thêm restaurant ID mặc định nếu không tìm thấy
        phone: values.phone,
        reservation_time: reservationTime,
        timeSlot: values.timeSlot,
        number_of_people: values.numberOfPeople,
        status: values.status || "confirmed", // Staff can directly confirm reservations
      };

       await createReservation(reservationData);
      message.success("Đặt bàn thành công!");
      form.resetFields();
      navigate("/staff/reservation");
    } catch (error) {
      console.error("Failed to create reservation:", error);
      message.error("Đặt bàn thất bại. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  

  return (
    <div>
      <h1 className="staff-content__header">Thêm mới bàn đặt</h1>

      <Card title="Thêm Bàn Đặt Mới" bordered={false}>
        <Form
          form={form}
          name="staff_reservation"
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            status: "confirmed",
            numberOfPeople: 2,
          }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="customer"
                label="Khách hàng"
                rules={[
                  { required: true, message: "Vui lòng chọn khách hàng!" },
                ]}
              >
                <Select
                  showSearch
                  placeholder="Chọn khách hàng"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {customers.map((customer) => (
                    <Option key={customer.id} value={customer.id}>
                      {customer.full_name || customer.username} {customer.phone ? `(${customer.phone})` : ""} 
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  {
                    pattern: /^[0-9]{10,11}$/,
                    message: "Số điện thoại không hợp lệ!",
                  },
                ]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="reservationDate"
                label="Ngày đặt"
                rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                  onChange={handleDateChange}
                  disabledDate={(current) =>
                    current && current < moment().startOf("day")
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="timeSlot"
                label="Giờ đặt"
                rules={[{ required: true, message: "Vui lòng chọn giờ!" }]}
              >
                <Select placeholder="Chọn giờ" onChange={handleTimeSlotChange}>
                  {timeSlots.map((slot) => (
                    <Option key={slot} value={slot}>
                      {slot}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="numberOfPeople"
                label="Số người"
                rules={[{ required: true, message: "Vui lòng nhập số người!" }]}
              >
                <InputNumber
                  min={1}
                  max={20}
                  style={{ width: "100%" }}
                  placeholder="Số người"
                  prefix={<TeamOutlined />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="table"
                label="Bàn"
                rules={[{ required: true, message: "Vui lòng chọn bàn!" }]}
              >
                <Select placeholder="Chọn bàn" loading={loading}>
                  {(availableTables.length > 0 ? availableTables : tables).map(
                    (table) => (
                      <Option
                        key={table.id}
                        value={table.id}
                        disabled={
                          availableTables.length > 0 &&
                          !availableTables.some((t) => t.id === table.id)
                        }
                      >
                        {table.name} - {table.capacity} người
                      </Option>
                    )
                  )}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="status" label="Trạng thái">
            <Select placeholder="Chọn trạng thái">
              <Option value="pending">Đang chờ</Option>
              <Option value="confirmed">Đã xác nhận</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Tạo đặt bàn
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ReservationAdd;