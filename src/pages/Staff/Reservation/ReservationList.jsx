import { useState, useEffect } from "react";
import { debounce } from "lodash";
import { Table, Tag, Spin, Button, message, Modal, Form, Input, InputNumber, DatePicker, Select, Space } from "antd";
import { useAuth } from "../../../components/context/authContext";
import moment from "moment";
import { getReservationsByRestaurant, updateReservation } from "../../../services/reservationService";
import { getTablesByRestaurant } from "../../../services/tableService";

const ReservationList = () => {
  const { user } = useAuth();
  const restaurantId = user.restaurant.id;
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [tables, setTables] = useState([]);
  const [form] = Form.useForm();

  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const pageSize = 10;

  const debouncedSearch = debounce((value) => {
    setSearchKeyword(value);
    setCurrentPage(1);
  }, 500);

  // Status colors
  const statusColors = {
    pending: "gold",
    confirmed: "blue",
    completed: "green",
    cancelled: "red",
  };

  // State cho các timeSlots có sẵn
  const timeSlots = [
    "10h:00",
    "11h:00",
    "12h:00",
    "13h:00",
    "14h:00",
    "15h:00",
    "16h:00",
    "17h:00",
    "18h:00",
    "19h:00",
    "20h:00",
  ];

  // Cập nhật useEffect để tải dữ liệu đặt bàn với tìm kiếm và phân trang
  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      try {
        // Tạo đối tượng params với thông tin phân trang
        const params = {
          page: currentPage,
          limit: pageSize,
        };

        // Thêm tham số tìm kiếm nếu có
        if (searchKeyword.trim()) {
          params.search = searchKeyword.trim();
        }

        // Gọi API với các tham số
        const res = await getReservationsByRestaurant(restaurantId, params);

        // Cập nhật state với dữ liệu trả về
        setReservations(res.results || []);
        setTotalResults(res.totalResults || 0);
      } catch (error) {
        console.error("Error fetching reservations:", error);
        message.error("Không thể tải danh sách đặt bàn");
        setReservations([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [restaurantId, currentPage, pageSize, searchKeyword]);

  // Thêm useEffect mới để load danh sách bàn
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await getTablesByRestaurant(restaurantId);
        setTables(res || []);
      } catch (error) {
        console.error("Error fetching tables:", error);
        message.error("Không thể tải danh sách bàn");
        setTables([]);
      }
    };

    fetchTables();
  }, [restaurantId]);

  const handleViewDetail = (reservation) => {
    setEditingReservation(reservation);
    setModalVisible(true);

    // Cập nhật form với dữ liệu hiện tại
    form.setFieldsValue({
      customerName: reservation.customer?.full_name || "",
      phone: reservation.phone || "",
      number_of_people: reservation.number_of_people || 1,
      tableId: reservation.table?.id || "",
      date: reservation.reservation_time ? moment(reservation.reservation_time) : null,
      timeSlot: reservation.timeSlot || "",
      status: reservation.status || "pending",
    });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setModalLoading(true);

      // Chuẩn bị dữ liệu để gửi lên server
      const updatedData = {
        table: values.tableId,
        phone: values.phone,
        number_of_people: values.number_of_people,
        timeSlot: values.timeSlot,
        status: values.status,
        // Kết hợp ngày từ date và thời gian từ timeSlot
        reservation_time: values.date ? values.date.format("YYYY-MM-DD") : null,
      };

      // Gọi API cập nhật
      await updateReservation(editingReservation.id, updatedData);

      message.success("Cập nhật thông tin đặt bàn thành công!");
      setModalVisible(false);

      // Làm mới danh sách đặt bàn
      const res = await getReservationsByRestaurant(restaurantId);
      setReservations(res.results || []);
    } catch (error) {
      console.error("Error updating reservation:", error);
      message.error("Không thể cập nhật thông tin đặt bàn");
    } finally {
      setModalLoading(false);
    }
  };

  const getNextStatuses = (currentStatus) => {
    switch (currentStatus) {
      case "pending":
        return ["confirmed", "cancelled"];
      case "confirmed":
        return ["completed"];
      default:
        return [];
    }
  };
  const handleChangeStatus = async (reservation, newStatus) => {
    try {
      // Cập nhật trạng thái của đơn đặt bàn
      await updateReservation(reservation.id, { status: newStatus });
      message.success(`Đã chuyển trạng thái thành ${newStatus}`);

      // Làm mới danh sách đặt bàn
      const res = await getReservationsByRestaurant(restaurantId);
      setReservations(res.results || []);
    } catch (error) {
      console.error("Error updating status:", error);
      message.error("Không thể cập nhật trạng thái");
    }
  };

  const columns = [
    {
      title: "Người đặt",
      dataIndex: ["customer", "full_name"],
      key: "customerName",
      render: (fullName) => fullName || "Không xác định",
    },
    {
      title: "Bàn đặt",
      dataIndex: "table",
      key: "table",
      render: (table) => table?.name || "Chưa xác định",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Số người",
      dataIndex: "number_of_people",
      key: "number_of_people",
    },
    {
      title: "Thời gian đặt",
      dataIndex: "reservation_time", // Sửa từ "reservationTime" thành "reservation_time"
      key: "reservationTime",
      render: (time, record) => {
        const d = new Date(time);
        const pad = (n) => n.toString().padStart(2, "0");
        const date = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

        // Kết hợp ngày đặt với timeSlot
        return `${date} (${record.timeSlot})`;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        const nextStatuses = getNextStatuses(status);

        // Nếu không có trạng thái tiếp theo (đã completed hoặc cancelled)
        if (nextStatuses.length === 0) {
          return <Tag color={statusColors[status] || "default"}>{status}</Tag>;
        }

        // Nếu có các trạng thái tiếp theo, hiển thị Select
        return (
          <Select value={status} style={{ minWidth: 120 }} onChange={(value) => handleChangeStatus(record, value)}>
            <Select.Option value={status}>
              <Tag color={statusColors[status] || "default"} style={{ marginRight: 0 }}>
                {status}
              </Tag>
            </Select.Option>
            {nextStatuses.map((s) => (
              <Select.Option key={s} value={s}>
                <Tag color={statusColors[s] || "default"} style={{ marginRight: 0 }}>
                  {s}
                </Tag>
              </Select.Option>
            ))}
          </Select>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => {
        // Chỉ cho phép xem chi tiết khi ở trạng thái pending hoặc confirmed
        if (record.status === "pending" || record.status === "confirmed") {
          return (
            <Button type="primary" onClick={() => handleViewDetail(record)}>
              Xác nhận đặt bàn
            </Button>
          );
        }

        // Với các trạng thái khác, hiển thị nút vô hiệu hóa
        return (
          <Button
            disabled
            style={{
              backgroundColor: "#f6ffed",
              color: "#389e0d",
              borderColor: "#b7eb8f",
            }}
          >
            Đã xác nhận
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <h1 className="staff-content__header">Danh sách bàn đặt</h1>
      <div className="staff-reservation-filter">
        <Input.Search
          placeholder="Tìm kiếm theo tên khách hàng hoặc SĐT"
          style={{ width: 300, marginLeft: 16 }}
          value={searchKeyword}
          onChange={(e) => debouncedSearch(e.target.value)}
          onSearch={(value) => {
            setSearchKeyword(value);
            setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
          }}
          allowClear // Khi xóa tìm kiếm, sẽ hiển thị lại tất cả
        />
      </div>
      <div className="staff-reservation">
        {loading ? (
          <Spin size="large" />
        ) : (
          <Table
            columns={columns}
            dataSource={reservations}
            rowKey="id"
            pagination={{
              pageSize: pageSize,
              current: currentPage,
              showSizeChanger: false,
              total: totalResults,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đặt bàn`,
              onChange: (page) => {
                setCurrentPage(page);
              },
            }}
          />
        )}
      </div>

      {/* Modal chi tiết đặt bàn */}
      <Modal
        title="Chi tiết đặt bàn"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="save" type="primary" loading={modalLoading} onClick={handleSave}>
            Lưu
          </Button>,
        ]}
        width={600}
      >
        {editingReservation && (
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              customerName: editingReservation.customer?.full_name || "",
              phone: editingReservation.phone || "",
              number_of_people: editingReservation.number_of_people || 1,
              tableId: editingReservation.table?.id || "",
              date: editingReservation.reservation_time ? moment(editingReservation.reservation_time) : null,
              timeSlot: editingReservation.timeSlot || "",
              status: editingReservation.status || "pending",
            }}
          >
            <Form.Item label="Người đặt" name="customerName">
              <Input disabled />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Số người"
              name="number_of_people"
              rules={[{ required: true, message: "Vui lòng nhập số người!" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>

            <Space style={{ display: "flex", width: "100%" }} size="middle">
              <Form.Item
                label="Ngày đặt"
                name="date"
                rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
                style={{ width: "100%" }}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>

              <Form.Item
                label="Giờ đặt"
                name="timeSlot"
                rules={[{ required: true, message: "Vui lòng chọn giờ!" }]}
                style={{ width: "100%" }}
              >
                <Select>
                  {timeSlots.map((slot) => (
                    <Select.Option key={slot} value={slot}>
                      {slot}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Space>

            <Form.Item label="Bàn" name="tableId" rules={[{ required: true, message: "Vui lòng chọn bàn!" }]}>
              <Select>
                {tables.map((table) => (
                  <Select.Option key={table.id} value={table.id}>
                    {table.name} (Sức chứa: {table.capacity} người)
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Trạng thái">
              <Form.Item name="status" noStyle>
                <Input type="hidden" />
              </Form.Item>
              {editingReservation && (
                <Tag color={statusColors[editingReservation.status] || "default"}>{editingReservation.status}</Tag>
              )}
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default ReservationList;
