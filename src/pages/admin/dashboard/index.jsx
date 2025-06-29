import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Typography,
  Spin,
  Button,
  Calendar,
  Badge,
  Divider,
  Select,
} from "antd";
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarCircleOutlined,
  CalendarOutlined,
  PieChartOutlined,
  TeamOutlined,
  ShopOutlined,
  CarryOutOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import Chart from "react-apexcharts";
import moment from "moment";
import "moment/locale/vi";

import { getRestaurants } from "../../../services/restaurantServices";
import { Option } from "antd/es/mentions";
import { getStatistics } from "../../../services/statisticService";

const { Title, Text } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayOrders: 0,
    activeReservations: 0,
    totalCustomers: 0,
    recentOrders: [],
    upcomingReservations: [],
    topDishes: [],
    orderStatusCount: { pending: 0, preparing: 0, served: 0, finished: 0, cancelled: 0 },
    weeklyRevenue: Array(7).fill(0),
  });

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await getRestaurants();
        setRestaurants(response.results || []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách nhà hàng:", error);
      }
    };

    fetchRestaurants();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Sử dụng service để lấy data từ API, truyền restaurantId nếu có
        console.log(selectedRestaurant);
        let response;
        if (selectedRestaurant == null) {
          response = await getStatistics();
        } else {
          response = await getStatistics(selectedRestaurant);
        }
        // Trong trường hợp thực tế, API sẽ trả về dữ liệu theo nhà hàng
        // Hiện tại, tôi đang dùng dữ liệu mẫu và giả lập việc thay đổi dữ liệu theo nhà hàng

        // Nếu không chọn nhà hàng, hiển thị số liệu tổng hợp
        if (response) {
          setStats({
            totalRevenue: response.totalRevenue || 0,
            todayOrders: response.todayOrders || 0,
            activeReservations: response.activeReservations || 0,
            totalCustomers: response.totalCustomers || 0,
            recentOrders: response.recentOrders || [],
            upcomingReservations: response.upcomingReservations || [],
            topDishes: response.topDishes || [],
            orderStatusCount: response.orderStatusCount || {
              pending: 0,
              preparing: 0,
              served: 0,
              finished: 0,
              cancelled: 0,
            },
            weeklyRevenue: response.weeklyRevenue || Array(7).fill(0),
          });
        } else {
          console.warn("API không trả về dữ liệu hợp lệ, sử dụng dữ liệu mẫu");
          if (!selectedRestaurant) {
            setStats({
              totalRevenue: response.totalRevenue,
              todayOrders: response.todayOrders,
              activeReservations: response.activeReservations,
              totalCustomers: response.totalCustomers,
              recentOrders: response.recentOrders,
              upcomingReservations: response.upcomingReservations,
              topDishes: response.topDishes,
              orderStatusCount: response.orderStatusCount,
              weeklyRevenue: response.weeklyRevenue,
            });
          } else {
            // Giả lập dữ liệu cho từng nhà hàng (trong thực tế sẽ lấy từ API)
            // Đổi số liệu ngẫu nhiên để mô phỏng dữ liệu khác nhau giữa các nhà hàng
            const restaurantMultiplier = ((parseInt(selectedRestaurant) % 3) + 1) / 2;

            setStats({
              totalRevenue: Math.round(23456000 * restaurantMultiplier),
              todayOrders: Math.round(12 * restaurantMultiplier),
              activeReservations: Math.round(4 * restaurantMultiplier),
              totalCustomers: Math.round(80 * restaurantMultiplier),
              recentOrders: generateMockOrders(),
              upcomingReservations: generateMockReservations(),
              topDishes: generateMockTopDishes(),
              orderStatusCount: {
                pending: Math.round(2 * restaurantMultiplier),
                preparing: Math.round(3 * restaurantMultiplier),
                served: Math.round(5 * restaurantMultiplier),
                finished: Math.round(40 * restaurantMultiplier),
                cancelled: Math.round(2 * restaurantMultiplier),
              },
              weeklyRevenue: [
                Math.round(1200000 * restaurantMultiplier),
                Math.round(1500000 * restaurantMultiplier),
                Math.round(2100000 * restaurantMultiplier),
                Math.round(900000 * restaurantMultiplier),
                Math.round(2600000 * restaurantMultiplier),
                Math.round(3700000 * restaurantMultiplier),
                Math.round(2400000 * restaurantMultiplier),
              ],
            });
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu thống kê:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedRestaurant]);

  // Cấu hình biểu đồ doanh thu theo tuần
  const revenueChartOptions = {
    chart: {
      height: 350,
      type: "area",
      toolbar: { show: false },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    colors: ["#1890ff"],
    xaxis: {
      categories: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"],
    },
    tooltip: {
      y: {
        formatter: (val) => `${val.toLocaleString()} đ`,
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100],
      },
    },
  };

  // Cấu hình biểu đồ trạng thái đơn hàng
  const orderStatusChartOptions = {
    chart: {
      type: "donut",
    },
    colors: ["#faad14", "#1890ff", "#13c2c2", "#52c41a", "#ff4d4f"],
    labels: ["Đang chờ", "Đang chuẩn bị", "Đã phục vụ", "Hoàn thành", "Đã hủy"],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  // Cột của bảng đơn hàng gần đây
  const orderColumns = [
    {
      title: "Mã đơn",
      dataIndex: "id",
      key: "id",
      render: (id) => <Link to={`/admin/orders/${id}`}>{id.substring(0, 8).toUpperCase()}</Link>,
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Thời gian",
      dataIndex: "orderTime",
      key: "orderTime",
      render: (time) => moment(time).format("DD/MM/YYYY"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      render: (total) => `${total.toLocaleString()} đ`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        let text = "Không xác định";

        switch (status) {
          case "pending":
            color = "gold";
            text = "Đang chờ";
            break;
          case "preparing":
            color = "blue";
            text = "Đang chuẩn bị";
            break;
          case "served":
            color = "cyan";
            text = "Đã phục vụ";
            break;
          case "finished":
            color = "green";
            text = "Hoàn thành";
            break;
          case "cancelled":
            color = "red";
            text = "Đã hủy";
            break;
          default:
            break;
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  // Cột của bảng đặt bàn sắp tới
  const reservationColumns = [
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Bàn",
      dataIndex: "tableName",
      key: "tableName",
    },
    {
      title: "Thời gian",
      dataIndex: "reservationTime",
      key: "reservationTime",
    },
    {
      title: "Số người",
      dataIndex: "guestCount",
      key: "guestCount",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "";
        let text = "";

        switch (status) {
          case "pending":
            color = "gold";
            text = "Chờ xác nhận";
            break;
          case "confirmed":
            color = "green";
            text = "Đã xác nhận";
            break;
          case "cancelled":
            color = "red";
            text = "Đã hủy";
            break;
          default:
            color = "default";
            text = status;
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  // Hàm tạo dữ liệu mẫu cho đơn hàng
  function generateMockOrders() {
    const statuses = ["pending", "preparing", "served", "finished", "cancelled"];
    return Array(5)
      .fill()
      .map((_, i) => ({
        id: `order${i + 1}${Math.floor(Math.random() * 1000)}`,
        customerName: `Khách hàng ${i + 1}`,
        orderTime: new Date(Date.now() - Math.random() * 86400000 * 3),
        total: Math.floor(Math.random() * 500000) + 50000,
        status: statuses[Math.floor(Math.random() * statuses.length)],
      }));
  }

  // Hàm tạo dữ liệu mẫu cho đặt bàn
  function generateMockReservations() {
    const statuses = ["pending", "confirmed"];
    return Array(5)
      .fill()
      .map((_, i) => ({
        id: `res${i + 1}${Math.floor(Math.random() * 1000)}`,
        customerName: `Khách hàng ${String.fromCharCode(65 + i)}`,
        tableName: `Bàn ${Math.floor(Math.random() * 10) + 1}`,
        reservationTime: new Date(Date.now() + Math.random() * 86400000 * 7),
        guestCount: Math.floor(Math.random() * 6) + 1,
        status: statuses[Math.floor(Math.random() * statuses.length)],
      }));
  }

  // Hàm tạo dữ liệu mẫu cho món ăn phổ biến
  function generateMockTopDishes() {
    return [
      { name: "Gà quay lu", count: 28, revenue: 9800000 },
      { name: "Combo VIP111", count: 15, revenue: 14850000 },
      { name: "Lẩu thái", count: 22, revenue: 7700000 },
      { name: "Bò bít tết", count: 19, revenue: 5700000 },
      { name: "Cá hồi nướng", count: 13, revenue: 3900000 },
    ];
  }

  // Các sự kiện cho lịch
  function getListData(value) {
    const dateString = value.format("YYYY-MM-DD");
    const events = [];

    // Lọc các đặt bàn trong ngày được chọn
    const reservationsOnDate = stats.upcomingReservations.filter((reservation) => {
      // Chuyển đổi thời gian đặt bàn thành chuỗi ngày để so sánh
      const reservationDate = moment(reservation.reservationDate).format("YYYY-MM-DD");
      return reservationDate === dateString;
    });

    // Tạo sự kiện dựa trên dữ liệu thực
    if (reservationsOnDate.length > 0) {
      // Phân loại trạng thái đặt bàn
      const pendingCount = reservationsOnDate.filter((r) => r.status === "pending").length;
      const confirmedCount = reservationsOnDate.filter((r) => r.status === "confirmed").length;

      // Hiển thị các loại sự kiện khác nhau dựa trên trạng thái
      if (pendingCount > 0) {
        events.push({
          type: "warning",
          content: `${pendingCount} đặt bàn chờ xác nhận`,
        });
      }

      if (confirmedCount > 0) {
        events.push({
          type: "success",
          content: `${confirmedCount} đặt bàn đã xác nhận`,
        });
      }

      // Thêm tổng số đặt bàn nếu có nhiều hơn 1
      if (pendingCount + confirmedCount > 1) {
        events.push({
          type: "processing",
          content: `Tổng ${reservationsOnDate.length} đặt bàn`,
        });
      }
    }

    // Hiển thị hôm nay với màu khác
    if (value.isSame(moment(), "day")) {
      events.push({ type: "error", content: "Hôm nay" });
    }

    return events;
  }

  function dateCellRender(value) {
    const listData = getListData(value);
    return (
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {listData.map((item, index) => (
          <li key={index}>
            <Badge status={item.type} text={item.content} />
          </li>
        ))}
      </ul>
    );
  }

  // Khắc phục cảnh báo về dateCellRender đã deprecated bằng cách sử dụng cellRender
  const calendarCellRender = (current, info) => {
    if (info.type === "date") {
      return dateCellRender(current);
    }
    return info.originNode;
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <Title level={2} style={{ marginBottom: 0 }}>
            Tổng quan hệ thống
          </Title>
          <Text type="secondary" style={{ display: "block" }}>
            Xin chào, hôm nay là {moment().format("dddd, DD/MM/YYYY")}
          </Text>
        </div>

        <div style={{ minWidth: 250 }}>
          <Select
            placeholder="Chọn nhà hàng để xem thống kê"
            style={{ width: "100%" }}
            onChange={(value) => setSelectedRestaurant(value)}
            value={selectedRestaurant}
            allowClear
            onClear={() => setSelectedRestaurant(null)}
          >
            {restaurants.map((restaurant) => (
              <Option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {selectedRestaurant && restaurants.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Text strong>
            Đang xem thống kê cho:{" "}
            {restaurants.find((r) => r.id === selectedRestaurant)?.name || "Nhà hàng không xác định"} <br />
            Địa chỉ: {restaurants.find((r) => r.id === selectedRestaurant)?.address || "Nhà hàng không xác định"}
          </Text>
        </div>
      )}

      {!selectedRestaurant && (
        <div style={{ marginBottom: 16 }}>
          <Text strong>Đang xem thống kê tổng hợp cho toàn bộ chuỗi nhà hàng</Text>
        </div>
      )}

      {/* Các thẻ metric chính */}
      <Row>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={stats.totalRevenue}
              precision={0}
              valueStyle={{ color: "#3f8600" }}
              prefix={<DollarCircleOutlined />}
              suffix="đ"
              formatter={(value) => `${value.toLocaleString()}`}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">Tăng 15% so với tháng trước</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card>
            <Statistic
              title="Đơn hàng hôm nay"
              value={stats.todayOrders}
              precision={0}
              valueStyle={{ color: "#1890ff" }}
              prefix={<ShoppingCartOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">5 đơn đang chờ xử lý</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card>
            <Statistic
              title="Đặt bàn đang hoạt động"
              value={stats.activeReservations}
              precision={0}
              valueStyle={{ color: "#faad14" }}
              prefix={<CalendarOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">3 đặt bàn mới cần xác nhận</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng khách hàng"
              value={stats.totalCustomers}
              precision={0}
              valueStyle={{ color: "#722ed1" }}
              prefix={<UserOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">12 khách hàng mới trong tuần</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ và thống kê */}
      <Row style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="Doanh thu trong tuần">
            <Chart
              options={revenueChartOptions}
              series={[{ name: "Doanh thu", data: stats.weeklyRevenue }]}
              type="area"
              height={350}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Thống kê đơn hàng">
            <Chart
              options={orderStatusChartOptions}
              series={Object.values(stats.orderStatusCount)}
              type="donut"
              height={350}
            />
          </Card>
        </Col>
      </Row>

      {/* Đơn hàng gần đây và đặt bàn sắp tới */}
      <Row style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title="Đơn hàng gần đây"
            extra={
              <Button type="link">
                <Link to="/admin/orders">Xem tất cả</Link>
              </Button>
            }
          >
            <Table columns={orderColumns} dataSource={stats.recentOrders} rowKey="id" pagination={false} size="small" />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="Đặt bàn sắp tới"
            extra={
              <Button type="link">
                <Link to="/admin/reservations">Xem tất cả</Link>
              </Button>
            }
          >
            <Table
              columns={reservationColumns}
              dataSource={stats.upcomingReservations}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Món ăn phổ biến và lịch */}
      <Row style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title="Món ăn phổ biến"
            extra={
              <Button type="link">
                <Link to="/admin/dishes">Quản lý menu</Link>
              </Button>
            }
          >
            <Table
              dataSource={stats.topDishes}
              pagination={false}
              size="small"
              columns={[
                {
                  title: "Tên món",
                  dataIndex: "name",
                  key: "name",
                },
                {
                  title: "Số lượng đã bán",
                  dataIndex: "count",
                  key: "count",
                  sorter: (a, b) => a.count - b.count,
                },
                {
                  title: "Doanh thu",
                  dataIndex: "revenue",
                  key: "revenue",
                  render: (revenue) => `${revenue.toLocaleString()} đ`,
                  sorter: (a, b) => a.revenue - b.revenue,
                },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Lịch đặt bàn">
            <Calendar
              fullscreen={false}
              cellRender={calendarCellRender}
              onSelect={(date) => {
                // Xử lý khi người dùng chọn một ngày cụ thể
                const dateString = date.format("YYYY-MM-DD");
                const reservationsOnDate = stats.upcomingReservations.filter((reservation) => {
                  const reservationDate = moment(reservation.reservationDate).format("YYYY-MM-DD");
                  return reservationDate === dateString;
                });

                if (reservationsOnDate.length > 0) {
                  console.log(`Các đặt bàn ngày ${dateString}:`, reservationsOnDate);
                  // Có thể hiển thị modal chi tiết đặt bàn ở đây
                }
              }}
              mode="month" // Mặc định ở chế độ tháng
            />
          </Card>
        </Col>
      </Row>

      {/* Các chức năng quản lý chính */}
      <Divider orientation="left" style={{ marginTop: 24 }}>
        Truy cập nhanh
      </Divider>
      <Row>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card hoverable>
            <Link to="/admin/order" style={{ display: "block", textAlign: "center" }}>
              <ShoppingCartOutlined style={{ fontSize: 24, color: "#1890ff" }} />
              <div style={{ marginTop: 12 }}>Quản lý đơn hàng</div>
            </Link>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card hoverable>
            <Link to="/admin/reservation" style={{ display: "block", textAlign: "center" }}>
              <CalendarOutlined style={{ fontSize: 24, color: "#faad14" }} />
              <div style={{ marginTop: 12 }}>Quản lý đặt bàn</div>
            </Link>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card hoverable>
            <Link to="/admin/dishes" style={{ display: "block", textAlign: "center" }}>
              <PieChartOutlined style={{ fontSize: 24, color: "#722ed1" }} />
              <div style={{ marginTop: 12 }}>Quản lý menu</div>
            </Link>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card hoverable>
            <Link to="/admin/user" style={{ display: "block", textAlign: "center" }}>
              <TeamOutlined style={{ fontSize: 24, color: "#eb2f96" }} />
              <div style={{ marginTop: 12 }}>Quản lý nhân viên</div>
            </Link>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card hoverable>
            <Link to="/admin/restaurant" style={{ display: "block", textAlign: "center" }}>
              <ShopOutlined style={{ fontSize: 24, color: "#52c41a" }} />
              <div style={{ marginTop: 12 }}>Quản lý nhà hàng</div>
            </Link>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card hoverable>
            <Link to="/admin/table" style={{ display: "block", textAlign: "center" }}>
              <CarryOutOutlined style={{ fontSize: 24, color: "#fa8c16" }} />
              <div style={{ marginTop: 12 }}>Quản lý bàn</div>
            </Link>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
