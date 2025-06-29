import { useState, useEffect, useCallback } from "react";
import { Table, Card, Button, Space, Tag, message, Row, Col, Input, Select, Tooltip } from "antd";
import { PlusOutlined, ReloadOutlined, ExportOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import moment from "moment";
import { useAuth } from "../../../components/context/authContext";
import { getOrdersByRestaurant, getAllOrders, updateOrderStatus } from "../../../services/orderService";
import OrderDetailModal from "./OrderDetailModal";
import OrderEditModal from "./OrderEditModal";
import OrderAddModal from "./OrderAddModal";
import * as XLSX from "xlsx";
import { getRestaurants } from "../../../services/restaurantServices";

const { Option } = Select;

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

const AdminOrderList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role?.name === "admin";
  const isManager = user?.role?.name === "manager";
  const userRestaurantId = user?.restaurant?.id;

  // State
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [filters, setFilters] = useState({
    dateRange: null,
    status: null,
    orderType: null,
    search: "",
    restaurant: isManager ? userRestaurantId : null,
  });

  const [restaurants, setRestaurants] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  // Fetch danh sách đơn hàng
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      // Chuẩn bị tham số truy vấn
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
      };

      if (filters.status) {
        params.status = filters.status;
      }

      if (filters.orderType) {
        params.orderType = filters.orderType;
      }

      if (filters.search) {
        params.search = filters.search;
      }

      // Quyết định API call dựa trên vai trò
      let response;
      if (isAdmin && !filters.restaurant) {
        // Admin xem tất cả đơn hàng
        response = await getAllOrders(params);
      } else {
        // Admin với nhà hàng cụ thể hoặc Manager với nhà hàng của họ
        const restaurantId = filters.restaurant || userRestaurantId;
        response = await getOrdersByRestaurant(restaurantId, params);
      }

      setData(response.results || []);
      setPagination((prev) => ({
        ...prev,
        total: response.totalResults || 0,
      }));
    } catch (error) {
      console.error("Lỗi khi tải danh sách đơn hàng:", error);
      message.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [filters, isAdmin, pagination.current, pagination.pageSize, userRestaurantId]);

  // Fetch danh sách nhà hàng cho admin
  const fetchRestaurants = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const response = await getRestaurants();
      setRestaurants(response.results || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách nhà hàng:", error);
    }
  }, [isAdmin]);

  // Load dữ liệu ban đầu
  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  // Load dữ liệu khi thay đổi bộ lọc
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Xử lý thay đổi trang
  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  // Xử lý thay đổi bộ lọc
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

  // Xem chi tiết đơn hàng
  const handleViewDetails = (record) => {
    setSelectedOrder(record);
    setDetailModalVisible(true);
  };

  // Chỉnh sửa đơn hàng
  const handleEditOrder = (record) => {
    setSelectedOrder(record);
    setEditModalVisible(true);
  };

  // Xuất file Excel
  const exportToExcel = () => {
    // Chuẩn bị dữ liệu xuất
    const exportData = data.map((item, index) => ({
      STT: index + 1,
      "Mã đơn hàng": item.id?.substring(0, 8).toUpperCase() || "",
      "Tên khách": item.fullName || "",
      "Loại đơn": orderTypeText[item.orderType] || item.orderType,
      Bàn: item.table?.name || "",
      "Nhà hàng": item.restaurant?.name || "",
      "Thời gian đặt": moment(item.orderTime).format("DD/MM/YYYY HH:mm"),
      "Trạng thái": statusText[item.status] || item.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Đơn hàng");

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
    XLSX.writeFile(workbook, `don-hang-${dateStr}.xlsx`);
  };

  const handleStatusChange = async (record, newStatus) => {
    try {
      setLoading(true);
      await updateOrderStatus(record.id, newStatus);

      // Cập nhật state data để hiển thị thay đổi ngay lập tức
      setData((prevData) => prevData.map((item) => (item.id === record.id ? { ...item, status: newStatus } : item)));

      message.success(`Đã cập nhật trạng thái thành ${statusText[newStatus] || newStatus}`);
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
      message.error("Không thể cập nhật trạng thái đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // Cấu hình các cột trong bảng
  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Mã đơn hàng",
      key: "orderId",
      render: (_, record) => record.id?.substring(0, 8).toUpperCase() || "",
    },
    {
      title: "Tên khách",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Loại đơn",
      dataIndex: "orderType",
      key: "orderType",
      render: (orderType) => orderTypeText[orderType] || orderType,
    },
    {
      title: "Bàn",
      dataIndex: ["table", "name"],
      key: "table",
      render: (text) => text || "Không xác định",
    },
    {
      title: "Nhà hàng",
      dataIndex: ["table", "restaurant", "name"],
      key: "restaurant",
      render: (text) => text || "Không xác định",
      // Chỉ hiển thị với admin
      hidden: !isAdmin,
    },
    {
      title: "Thời gian đặt",
      dataIndex: "orderTime",
      key: "orderTime",
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        // Xác định những trạng thái có thể chuyển tiếp
        const getNextStatuses = (currentStatus) => {
          switch (currentStatus) {
            case "pending":
              return ["preparing", "cancelled"];
            case "preparing":
              return ["served", "cancelled"];
            case "served":
              return ["finished", "cancelled"];
            default:
              return []; // Các trạng thái cuối cùng không có chuyển tiếp
          }
        };

        const nextStatuses = getNextStatuses(status);

        // Nếu đơn hàng đã hoàn thành hoặc đã hủy, hoặc người dùng không có quyền, chỉ hiển thị tag
        if (status === "finished" || status === "cancelled" || (!isAdmin && !isManager)) {
          return <Tag color={statusColors[status] || "default"}>{statusText[status] || status}</Tag>;
        }

        // Nếu có quyền thay đổi và đơn hàng chưa ở trạng thái cuối
        return (
          <Select
            value={status}
            style={{ minWidth: 140 }}
            onChange={(value) => handleStatusChange(record, value)}
            disabled={loading}
          >
            <Option key={status} value={status}>
              <Tag color={statusColors[status] || "default"} style={{ marginRight: 0 }}>
                {statusText[status] || status}
              </Tag>
            </Option>
            {nextStatuses.map((nextStatus) => (
              <Option key={nextStatus} value={nextStatus}>
                <Tag color={statusColors[nextStatus] || "default"} style={{ marginRight: 0 }}>
                  {statusText[nextStatus] || nextStatus}
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
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button type="primary" icon={<EditOutlined />} onClick={() => handleEditOrder(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ].filter((column) => !column.hidden);

  return (
    <>
      <Card
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Quản lý đơn hàng</span>
            <span style={{ fontSize: "14px", fontWeight: "normal" }}>
              Ngày hiện tại: {moment().format("DD/MM/YYYY")}
            </span>
          </div>
        }
        extra={
          <Space>
            <Button icon={<PlusOutlined />} type="primary" onClick={() => setAddModalVisible(true)}>
              Thêm đơn hàng
            </Button>

            <Button icon={<ExportOutlined />} onClick={exportToExcel}>
              Xuất Excel
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchOrders();
              }}
            >
              Làm mới
            </Button>
          </Space>
        }
      >
        {/* Bộ lọc nhanh */}
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col lg={6} md={12} sm={24}>
              <Input.Search
                placeholder="Tìm theo tên khách"
                onSearch={(value) => handleFilterChange({ search: value })}
                style={{ width: "100%" }}
                allowClear
              />
            </Col>
            {isAdmin && (
              <Col lg={6} md={12} sm={24}>
                <Select
                  placeholder="Chọn nhà hàng"
                  style={{ width: "100%" }}
                  allowClear
                  onChange={(value) => handleFilterChange({ restaurant: value })}
                  disabled={isManager}
                  value={filters.restaurant}
                >
                  {restaurants.map((restaurant) => (
                    <Option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </Option>
                  ))}
                </Select>
              </Col>
            )}
            <Col lg={6} md={12} sm={24}>
              <Select
                placeholder="Trạng thái đơn hàng"
                style={{ width: "100%" }}
                allowClear
                onChange={(value) => handleFilterChange({ status: value })}
                value={filters.status}
              >
                <Option value="pending">Đang chờ</Option>
                <Option value="preparing">Đang chuẩn bị</Option>
                <Option value="served">Đã phục vụ</Option>
                <Option value="finished">Hoàn thành</Option>
                <Option value="cancelled">Đã hủy</Option>
              </Select>
            </Col>
            <Col lg={6} md={12} sm={24}>
              <Select
                placeholder="Loại đơn hàng"
                style={{ width: "100%" }}
                allowClear
                onChange={(value) => handleFilterChange({ orderType: value })}
                value={filters.orderType}
              >
                <Option value="dine-in">Tại bàn</Option>
                <Option value="online">Online</Option>
              </Select>
            </Col>
          </Row>
        </div>

        {/* Bảng dữ liệu */}
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} đơn hàng`,
            pageSizeOptions: ["10", "20", "50"],
          }}
          onChange={handleTableChange}
          loading={loading}
          scroll={{ x: "max-content" }}
        />
      </Card>

      {/* Modal chi tiết đơn hàng */}
      <OrderDetailModal
        visible={detailModalVisible}
        order={selectedOrder}
        onClose={() => setDetailModalVisible(false)}
      />

      {/* Modal chỉnh sửa đơn hàng */}
      <OrderEditModal
        visible={editModalVisible}
        order={selectedOrder}
        onClose={() => setEditModalVisible(false)}
        onSuccess={() => {
          setEditModalVisible(false);
          fetchOrders();
        }}
      />

      {/* Modal thêm đơn hàng */}
      <OrderAddModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSuccess={() => {
          setAddModalVisible(false);
          fetchOrders();
        }}
        restaurantId={filters.restaurant || userRestaurantId}
      />
    </>
  );
};

export default AdminOrderList;
