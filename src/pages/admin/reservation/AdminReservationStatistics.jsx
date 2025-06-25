import { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, DatePicker, Select, Space, Spin, Button, Table, Typography, Divider } from "antd";
import { Column, Pie } from "@ant-design/plots";
import { FileExcelOutlined, CalendarOutlined, ReloadOutlined } from "@ant-design/icons";
import moment from "moment";
import { useAuth } from "../../../components/context/authContext";
import { getReservationsByRestaurant } from "../../../services/reservationService";
import { getRestaurants } from "../../../services/restaurantService";
import * as XLSX from "xlsx";

const { Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const AdminReservationStatistics = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";
  const userRestaurantId = user?.restaurant?.id;

  // State
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(isManager ? userRestaurantId : null);
  const [dateRange, setDateRange] = useState([moment().subtract(30, "days"), moment()]);
  const [statsData, setStatsData] = useState({
    totalReservations: 0,
    byStatus: [],
    byDay: [],
    byHour: [],
    topTables: [],
  });

  // Fetch restaurants (for admin)
  const fetchRestaurants = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const response = await getRestaurants();
      setRestaurants(response.results || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách nhà hàng:", error);
    }
  }, [isAdmin]);

  // Fetch stats data
  const fetchStatsData = useCallback(async () => {
    if (!selectedRestaurant && !isAdmin) return;

    setLoading(true);
    try {
      // Prepare query params for date range
      const params = {};
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.startDate = dateRange[0].format("YYYY-MM-DD");
        params.endDate = dateRange[1].format("YYYY-MM-DD");
        params.limit = 1000; // Giả định sẽ lấy tất cả dữ liệu trong khoảng thời gian
      }

      // Get reservations data
      const restaurantId = selectedRestaurant || userRestaurantId;
      let reservationsData = [];

      if (restaurantId) {
        const response = await getReservationsByRestaurant(restaurantId, params);
        reservationsData = response.results || [];
      } else if (isAdmin) {
        // For admin with no restaurant selected, fetch all
        const allRestaurantsPromises = restaurants.map((restaurant) =>
          getReservationsByRestaurant(restaurant.id, params)
        );

        const responses = await Promise.all(allRestaurantsPromises);
        reservationsData = responses.flatMap((res) => res.results || []);
      }

      // Process data for statistics
      processStatsData(reservationsData);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu thống kê:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurant, dateRange, restaurants, isAdmin, userRestaurantId]);

  // Initial load
  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  // Fetch stats when filters change
  useEffect(() => {
    fetchStatsData();
  }, [fetchStatsData]);

  // Process statistics data
  const processStatsData = (reservationsData) => {
    // Total count
    const totalReservations = reservationsData.length;

    // By status
    const byStatus = [
      { type: "Đang chờ", value: 0, status: "pending" },
      { type: "Đã xác nhận", value: 0, status: "confirmed" },
      { type: "Hoàn thành", value: 0, status: "completed" },
      { type: "Đã hủy", value: 0, status: "cancelled" },
    ];

    // Count by status
    reservationsData.forEach((item) => {
      const statusItem = byStatus.find((s) => s.status === item.status);
      if (statusItem) {
        statusItem.value++;
      }
    });

    // By day
    const byDay = {};
    // By hour
    const byHour = {};
    // By table
    const byTable = {};

    // Process data
    reservationsData.forEach((item) => {
      // Process by day
      const day = moment(item.reservation_time).format("YYYY-MM-DD");
      byDay[day] = (byDay[day] || 0) + 1;

      // Process by hour
      const hour = item.timeSlot ? item.timeSlot.split(":")[0] + "h" : "N/A";
      byHour[hour] = (byHour[hour] || 0) + 1;

      // Process by table
      const tableId = item.table?.id;
      const tableName = item.table?.name || "Không xác định";

      if (tableId) {
        if (!byTable[tableId]) {
          byTable[tableId] = {
            tableId,
            tableName,
            count: 0,
            capacity: item.table?.capacity || 0,
            restaurant: item.restaurant?.name || "Không xác định",
          };
        }
        byTable[tableId].count++;
      }
    });

    // Convert byDay to array
    const byDayArray = Object.entries(byDay)
      .map(([day, count]) => ({
        day: moment(day).format("DD/MM"),
        count,
      }))
      .sort((a, b) => moment(a.day, "DD/MM").valueOf() - moment(b.day, "DD/MM").valueOf());

    // Convert byHour to array
    const byHourArray = Object.entries(byHour)
      .filter(([hour]) => hour !== "N/A")
      .map(([hour, count]) => ({
        hour,
        count,
      }))
      .sort((a, b) => {
        const hourA = parseInt(a.hour.replace("h", ""));
        const hourB = parseInt(b.hour.replace("h", ""));
        return hourA - hourB;
      });

    // Convert byTable to array and get top tables
    const topTables = Object.values(byTable)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    setStatsData({
      totalReservations,
      byStatus,
      byDay: byDayArray,
      byHour: byHourArray,
      topTables,
    });
  };

  // Export to Excel
  const exportToExcel = () => {
    // Prepare sheets
    const sheets = {
      "Tổng quan": [
        { "Tổng số đặt bàn": statsData.totalReservations },
        { "Đang chờ": statsData.byStatus.find((s) => s.status === "pending")?.value || 0 },
        { "Đã xác nhận": statsData.byStatus.find((s) => s.status === "confirmed")?.value || 0 },
        { "Hoàn thành": statsData.byStatus.find((s) => s.status === "completed")?.value || 0 },
        { "Đã hủy": statsData.byStatus.find((s) => s.status === "cancelled")?.value || 0 },
      ],
      "Theo ngày": statsData.byDay.map((item) => ({
        Ngày: item.day,
        "Số lượng đặt bàn": item.count,
      })),
      "Theo giờ": statsData.byHour.map((item) => ({
        Giờ: item.hour,
        "Số lượng đặt bàn": item.count,
      })),
      "Bàn phổ biến": statsData.topTables.map((item, index) => ({
        STT: index + 1,
        Bàn: item.tableName,
        "Nhà hàng": item.restaurant,
        "Sức chứa": item.capacity,
        "Số lượt đặt": item.count,
      })),
    };

    const workbook = XLSX.utils.book_new();

    // Add each sheet
    for (const [name, data] of Object.entries(sheets)) {
      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, name);
    }

    // Generate filename with date range
    const startDate = dateRange[0].format("YYYYMMDD");
    const endDate = dateRange[1].format("YYYYMMDD");
    XLSX.writeFile(workbook, `thong-ke-dat-ban-${startDate}-${endDate}.xlsx`);
  };

  // Config for status pie chart
  const statusPieConfig = {
    data: statsData.byStatus,
    colorField: "type",
    angleField: "value",
    radius: 0.9,
    legend: {
      position: "bottom",
    },
    label: {
      type: "inner",
      offset: "-30%",
      content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
      style: {
        fontSize: 14,
        textAlign: "center",
      },
    },
    interactions: [{ type: "element-active" }],
    color: ["#faad14", "#1890ff", "#52c41a", "#ff4d4f"],
  };

  // Config for daily stats column chart
  const dailyColumnConfig = {
    data: statsData.byDay,
    xField: "day",
    yField: "count",
    meta: {
      day: { alias: "Ngày" },
      count: { alias: "Số lượng đặt bàn" },
    },
    color: "#1890ff",
    label: {
      position: "middle",
      style: {
        fill: "#FFFFFF",
        opacity: 0.8,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    interactions: [{ type: "element-active" }],
  };

  // Config for hourly stats column chart
  const hourlyColumnConfig = {
    data: statsData.byHour,
    xField: "hour",
    yField: "count",
    meta: {
      hour: { alias: "Giờ" },
      count: { alias: "Số lượng đặt bàn" },
    },
    color: "#722ed1",
    label: {
      position: "middle",
      style: {
        fill: "#FFFFFF",
        opacity: 0.8,
      },
    },
    interactions: [{ type: "element-active" }],
  };

  // Top tables columns config
  const topTablesColumns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Bàn",
      dataIndex: "tableName",
      key: "tableName",
    },
    {
      title: "Nhà hàng",
      dataIndex: "restaurant",
      key: "restaurant",
    },
    {
      title: "Sức chứa",
      dataIndex: "capacity",
      key: "capacity",
    },
    {
      title: "Số lượt đặt",
      dataIndex: "count",
      key: "count",
      sorter: (a, b) => a.count - b.count,
      defaultSortOrder: "descend",
    },
  ];

  return (
    <div>
      <Card
        title="Thống kê đặt bàn"
        extra={
          <Space>
            <Button
              icon={<FileExcelOutlined />}
              onClick={exportToExcel}
              disabled={loading || statsData.totalReservations === 0}
            >
              Xuất Excel
            </Button>
            <Button icon={<ReloadOutlined />} onClick={fetchStatsData} loading={loading}>
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<CalendarOutlined />}
              onClick={() => (window.location.href = "/admin/reservations")}
            >
              Xem danh sách
            </Button>
          </Space>
        }
      >
        {/* Filter controls */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            {isAdmin && (
              <Select
                placeholder="Chọn nhà hàng"
                style={{ width: 200 }}
                value={selectedRestaurant}
                onChange={setSelectedRestaurant}
                allowClear
                disabled={isManager}
              >
                {restaurants.map((restaurant) => (
                  <Option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </Option>
                ))}
              </Select>
            )}

            <RangePicker value={dateRange} onChange={setDateRange} format="DD/MM/YYYY" allowClear={false} />
          </Space>
        </div>

        <Spin spinning={loading}>
          {/* Overview Stats */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={6}>
              <Card>
                <Statistic
                  title="Tổng số đặt bàn"
                  value={statsData.totalReservations}
                  valueStyle={{ color: "#1890ff", fontSize: 24 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Đang chờ"
                  value={statsData.byStatus.find((s) => s.status === "pending")?.value || 0}
                  valueStyle={{ color: "#faad14", fontSize: 24 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Đã xác nhận"
                  value={statsData.byStatus.find((s) => s.status === "confirmed")?.value || 0}
                  valueStyle={{ color: "#1890ff", fontSize: 24 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Hoàn thành"
                  value={statsData.byStatus.find((s) => s.status === "completed")?.value || 0}
                  valueStyle={{ color: "#52c41a", fontSize: 24 }}
                />
              </Card>
            </Col>
          </Row>

          <Divider />

          {/* Charts */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={8}>
              <Card title="Thống kê theo trạng thái">
                {statsData.byStatus.some((item) => item.value > 0) ? (
                  <Pie {...statusPieConfig} />
                ) : (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <Text type="secondary">Không có dữ liệu</Text>
                  </div>
                )}
              </Card>
            </Col>
            <Col xs={24} md={16}>
              <Card title="Thống kê theo ngày">
                {statsData.byDay.length > 0 ? (
                  <Column {...dailyColumnConfig} />
                ) : (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <Text type="secondary">Không có dữ liệu</Text>
                  </div>
                )}
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} sm={24} md={12}>
              <Card title="Thống kê theo giờ">
                {statsData.byHour.length > 0 ? (
                  <Column {...hourlyColumnConfig} />
                ) : (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <Text type="secondary">Không có dữ liệu</Text>
                  </div>
                )}
              </Card>
            </Col>
            <Col xs={24} sm={24} md={12}>
              <Card title="Top 10 bàn được đặt nhiều nhất">
                <Table
                  columns={topTablesColumns}
                  dataSource={statsData.topTables}
                  rowKey="tableId"
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          </Row>
        </Spin>
      </Card>
    </div>
  );
};

// Simple Statistic component
const Statistic = ({ title, value, valueStyle }) => {
  return (
    <div>
      <div style={{ fontSize: 14, color: "rgba(0, 0, 0, 0.45)" }}>{title}</div>
      <div style={{ ...valueStyle, marginTop: 4 }}>{value}</div>
    </div>
  );
};

export default AdminReservationStatistics;
