import { useState, useEffect, useCallback } from "react";
import { Table, Card, Button, Space, Tag, message, Modal, Select, Input, Row, Col, Tooltip, Statistic } from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  ExportOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useAuth } from "../../../components/context/authContext";
import {
  getReservations,
  getReservationsByRestaurant,
  updateReservation,
  deleteReservation,
} from "../../../services/reservationService";
import { getRestaurants } from "../../../services/restaurantServices";
import * as XLSX from "xlsx";
import AdminReservationDetail from "./AdminReservationDetail";
import ReservationForm from "./ReservationForm";

const { Option } = Select;
const { confirm } = Modal;

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

const AdminReservationList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role?.name === "admin";
  const isManager = user?.role?.name === "manager";
  const userRestaurantId = user?.restaurant?.id;

  // State
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [filters, setFilters] = useState({
    dateRange: null,
    status: null,
    restaurant: isManager ? userRestaurantId : null,
    table: null,
    searchText: "",
  });

  const [selectedReservation, setSelectedReservation] = useState(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });

  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // State cho ReservationForm
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [formMode, setFormMode] = useState("create"); // 'create' hoặc 'edit'
  const [editingReservation, setEditingReservation] = useState(null);

  // Fetch reservations with params
  const fetchReservations = useCallback(
    async (params = {}) => {
      setLoading(true);
      try {
        // Prepare query params
        const queryParams = {
          page: params.page || pagination.current,
          limit: params.pageSize || pagination.pageSize,
          ...params,
        };

        // Handle status filter
        if (filters.status) {
          queryParams.status = filters.status;
        }

        // Handle table filter
        if (filters.table) {
          queryParams.table = filters.table;
        }

        // Handle search text
        if (filters.searchText) {
          queryParams.search = filters.searchText;
        }

        let response;

        if (isAdmin && !filters.restaurant) {
          // Admin xem tất cả đặt bàn từ tất cả nhà hàng
          response = await getReservations(queryParams);
        } else {
          // Trường hợp admin chọn một nhà hàng cụ thể hoặc manager xem nhà hàng của mình
          const restaurantId = filters.restaurant || userRestaurantId;
          response = await getReservationsByRestaurant(restaurantId, queryParams);
        }

        setData(response.results || []);
        setPagination((prev) => ({
          ...prev,
          total: response.totalResults || 0,
        }));
      } catch (error) {
        console.error("Lỗi khi tải danh sách đặt bàn:", error);
        message.error("Không thể tải danh sách đặt bàn");
      } finally {
        setLoading(false);
      }
    },
    [pagination.current, pagination.pageSize, filters, isAdmin, isManager, userRestaurantId]
  );

  // Calculate statistics
  const calculateStatistics = useCallback(async () => {
    try {
      // Trong thực tế, nên có API riêng để lấy thống kê
      // Đây là giải pháp tạm thời
      const params = { limit: 1000 }; // Lấy tối đa 1000 bản ghi để tính toán
      let response;

      if (isAdmin && !filters.restaurant) {
        // Admin xem thống kê tất cả đặt bàn
        response = await getReservations(params);
      } else {
        // Admin chọn một nhà hàng cụ thể hoặc manager xem nhà hàng của mình
        const restaurantId = filters.restaurant || userRestaurantId;
        response = await getReservationsByRestaurant(restaurantId, params);
      }

      const allReservations = response.results || [];

      // Tính toán thống kê
      const stats = {
        total: allReservations.length,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
      };

      // Đếm trạng thái
      allReservations.forEach((item) => {
        if (stats[item.status] !== undefined) {
          stats[item.status]++;
        }
      });

      setStatistics(stats);
    } catch (error) {
      console.error("Lỗi khi tính toán thống kê:", error);
    }
  }, [filters.restaurant, isAdmin, userRestaurantId]);

  // Fetch restaurants for admin
  const fetchRestaurants = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const response = await getRestaurants();
      setRestaurants(response.results || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách nhà hàng:", error);
    }
  }, [isAdmin]);

  // Initial load
  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  // Load data when filters change
  useEffect(() => {
    fetchReservations();
    calculateStatistics();
  }, [fetchReservations, calculateStatistics]);

  // Phân trang
  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });

    // Nếu có lọc theo trạng thái từ table
    if (filters.status && filters.status.length > 0) {
      handleFilterChange({ status: filters.status[0] });
    } else if (filters.status && filters.status.length === 0) {
      handleFilterChange({ status: null });
    }

    // Xử lý sắp xếp nếu cần
    if (sorter.field && sorter.order) {
      // Trong thực tế bạn có thể gửi sorter.field và sorter.order lên server
      console.log("Sort by:", sorter.field, sorter.order);
    }
  };

  // Thay đổi bộ lọc
  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
    setPagination((prev) => ({
      ...prev,
      current: 1, // Reset về trang đầu tiên khi thay đổi bộ lọc
    }));
  };

  // Reset bộ lọc
  const handleResetFilters = () => {
    const defaultFilters = {
      dateRange: null,
      status: null,
      table: null,
      searchText: "",
    };

    // Manager luôn giữ nhà hàng của họ
    if (isManager) {
      defaultFilters.restaurant = userRestaurantId;
    } else {
      defaultFilters.restaurant = null;
    }

    setFilters(defaultFilters);
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  // Xem chi tiết đặt bàn
  const handleViewDetails = (record) => {
    setSelectedReservation(record);
    setDetailModalVisible(true);
  };

  // Mở modal thêm mới
  const handleAddNew = () => {
    setFormMode("create");
    setEditingReservation(null);
    setFormModalVisible(true);
  };

  // Mở modal chỉnh sửa
  const handleEditReservation = (record) => {
    setFormMode("edit");
    setEditingReservation(record);
    setFormModalVisible(true);
  };

  // Xác nhận hủy đặt bàn
  const confirmDelete = (record) => {
    confirm({
      title: "Bạn có chắc chắn muốn xóa đặt bàn này?",
      icon: <ExclamationCircleOutlined />,
      content: `Đơn đặt bàn của ${
        record.customer?.full_name || "khách hàng"
      } sẽ bị xóa vĩnh viễn và không thể khôi phục.`,
      okText: "Xóa đặt bàn",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteReservation(record.id);
          message.success("Xóa đặt bàn thành công");
          fetchReservations(); // Tải lại danh sách
          calculateStatistics(); // Cập nhật thống kê
        } catch (error) {
          console.error("Lỗi khi xóa đặt bàn:", error);
          message.error("Không thể xóa đặt bàn");
        }
      },
    });
  };

  // Xuất Excel
  const exportToExcel = () => {
    // Chuẩn bị dữ liệu xuất
    const exportData = data.map((item, index) => ({
      STT: index + 1,
      "Khách hàng": item.customer?.full_name || "Không xác định",
      "Số điện thoại": item.phone || "",
      "Ngày đặt": moment(item.reservation_time).format("DD/MM/YYYY"),
      "Giờ đặt": item.timeSlot || "",
      "Số người": item.number_of_people || 0,
      Bàn: item.table?.name || "Chưa xác định",
      "Nhà hàng": item.restaurant?.name || "Không xác định",
      "Trạng thái": statusText[item.status] || item.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Đặt bàn");

    // Tự động điều chỉnh kích thước cột
    const maxWidths = {};
    exportData.forEach((row) => {
      Object.keys(row).forEach((key) => {
        const width = (row[key] || "").toString().length;
        maxWidths[key] = Math.max(maxWidths[key] || 0, width, key.length);
      });
    });

    worksheet["!cols"] = Object.keys(maxWidths).map((key) => ({ width: maxWidths[key] + 2 }));

    // Tạo tên file với ngày hiện tại
    const dateStr = moment().format("YYYY-MM-DD");
    XLSX.writeFile(workbook, `danh-sach-dat-ban-${dateStr}.xlsx`);
  };

  // Cập nhật trạng thái đặt bàn
  const handleStatusChange = async (record, newStatus) => {
    try {
      await updateReservation(record.id, { status: newStatus });
      message.success(`Cập nhật trạng thái thành công`);
      fetchReservations();
      calculateStatistics();
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      message.error("Không thể cập nhật trạng thái");
    }
  };

  // Lấy các trạng thái tiếp theo có thể chuyển đổi
  const getNextStatuses = (currentStatus) => {
    switch (currentStatus) {
      case "pending":
        return ["confirmed", "cancelled"];
      case "confirmed":
        return ["completed", "cancelled"];
      case "completed":
        return [];
      case "cancelled":
        return [];
      default:
        return [];
    }
  };

  // Xử lý sau khi thêm mới/chỉnh sửa thành công
  const handleFormSuccess = () => {
    fetchReservations();
    calculateStatistics();
  };

  // Cấu hình cột
  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Khách hàng",
      dataIndex: ["customer", "full_name"],
      key: "customerName",
      render: (text) => <span>{text || "Không xác định"}</span>,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 120,
    },
    {
      title: "Ngày đặt",
      dataIndex: "reservation_time",
      key: "date",
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Giờ đặt",
      dataIndex: "timeSlot",
      key: "time",
      width: 90,
    },
    {
      title: "Số người",
      dataIndex: "number_of_people",
      key: "numberOfPeople",
      width: 80,
    },
    {
      title: "Bàn",
      dataIndex: ["table", "name"],
      key: "table",
      render: (text) => text || "Chưa xác định",
    },
    {
      title: "Nhà hàng",
      dataIndex: ["restaurant", "name"],
      key: "restaurant",
      render: (text) => text || "Không xác định",
      // Chỉ hiển thị với admin
      hidden: !isAdmin && filters.restaurant !== null,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",

      render: (status, record) => {
        const nextStatuses = getNextStatuses(status);

        if (nextStatuses.length === 0) {
          return <Tag color={statusColors[status] || "default"}>{statusText[status] || status}</Tag>;
        }

        return (
          <Select
            value={status}
            style={{ minWidth: 140 }}
            onChange={(value) => handleStatusChange(record, value)}
            disabled={!isAdmin && !isManager}
          >
            <Option value={status}>
              <Tag color={statusColors[status] || "default"} style={{ marginRight: 0 }}>
                {statusText[status] || status}
              </Tag>
            </Option>
            {nextStatuses.map((s) => (
              <Option key={s} value={s}>
                <Tag color={statusColors[s] || "default"} style={{ marginRight: 0 }}>
                  {statusText[s] || s}
                </Tag>
              </Option>
            ))}
          </Select>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
          </Tooltip>

          <>
            <Tooltip title="Chỉnh sửa">
              <Button type="primary" icon={<EditOutlined />} onClick={() => handleEditReservation(record)} />
            </Tooltip>

            <Tooltip title="Xóa bàn đặt">
              <Button danger icon={<DeleteOutlined />} onClick={() => confirmDelete(record)} />
            </Tooltip>
          </>
        </Space>
      ),
    },
  ].filter((column) => !column.hidden);

  return (
    <>
      <Card
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Quản lý đặt bàn</span>
            <span style={{ fontSize: "14px", fontWeight: "normal" }}>
              Ngày hiện tại: {moment().format("DD/MM/YYYY")}
            </span>
          </div>
        }
        extra={
          <Space>
            {(isAdmin || isManager) && (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
                Thêm mới
              </Button>
            )}
            <Button type="primary" icon={<ExportOutlined />} onClick={exportToExcel}>
              Xuất Excel
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchReservations();
                calculateStatistics();
              }}
            >
              Làm mới
            </Button>
          </Space>
        }
      >
        {/* Thống kê tổng quan */}
        <div style={{ marginBottom: 20 }}>
          <Row gutter={16}>
            <Col xs={24} sm={6}>
              <Card size="small">
                <Statistic title="Tổng số đặt bàn" value={statistics.total} valueStyle={{ color: "#1890ff" }} />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic title="Đang chờ" value={statistics.pending} valueStyle={{ color: "#faad14" }} />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic title="Đã xác nhận" value={statistics.confirmed} valueStyle={{ color: "#1890ff" }} />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic title="Hoàn thành" value={statistics.completed} valueStyle={{ color: "#52c41a" }} />
              </Card>
            </Col>
          </Row>
        </div>

        {/* Bộ lọc nhanh */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            {isAdmin && (
              <Select
                placeholder="Lọc theo nhà hàng"
                style={{ width: 200 }}
                allowClear
                value={filters.restaurant}
                onChange={(value) => handleFilterChange({ restaurant: value, table: null })}
                disabled={isManager}
              >
                {restaurants.map((restaurant) => (
                  <Option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </Option>
                ))}
              </Select>
            )}

            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: 150 }}
              allowClear
              value={filters.status}
              onChange={(value) => handleFilterChange({ status: value })}
            >
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

            <Input.Search
              placeholder="Tìm theo tên/SĐT"
              style={{ width: 200 }}
              onSearch={(value) => handleFilterChange({ searchText: value })}
              allowClear
            />

            <Button onClick={handleResetFilters}>Xóa bộ lọc</Button>
          </Space>
        </div>

        {/* Bảng dữ liệu */}
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} đặt bàn`,
            pageSizeOptions: ["10", "20", "50"],
          }}
          onChange={handleTableChange}
          loading={loading}
          scroll={{ x: "max-content" }}
        />
      </Card>

      {/* Modal xem chi tiết */}
      <Modal
        title="Chi tiết đặt bàn"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={
          <Space>
            <Button onClick={() => setDetailModalVisible(false)}>Đóng</Button>
          </Space>
        }
        width={700}
      >
        {selectedReservation && <AdminReservationDetail reservation={selectedReservation} />}
      </Modal>

      {/* Form thêm mới / chỉnh sửa */}
      <ReservationForm
        visible={formModalVisible}
        onCancel={() => setFormModalVisible(false)}
        onSuccess={handleFormSuccess}
        reservation={formMode === "edit" ? editingReservation : null}
        restaurants={restaurants}
        userRole={user.role.name}
        userRestaurantId={userRestaurantId}
        userName={user.id}
      />
    </>
  );
};

export default AdminReservationList;
