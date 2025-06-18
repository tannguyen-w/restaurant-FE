// RevenueChart.jsx
import { useState, useEffect } from "react";
import { Column } from "@ant-design/charts";
import { Tabs, Card, Spin, Typography } from "antd";
import { getAllInvoices } from "../../../services/invoiceService";

const { Title } = Typography;

const RevenueChart = () => {
  const [timeRange, setTimeRange] = useState("week");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [rawInvoices, setRawInvoices] = useState([]);

  useEffect(() => {
    fetchInvoiceData();
  }, []);

  useEffect(() => {
    if (rawInvoices.length > 0) {
      processInvoiceData(timeRange);
    }
  }, [timeRange, rawInvoices]);

  // Lấy dữ liệu hóa đơn từ API
  const fetchInvoiceData = async () => {
    setLoading(true);
    try {
      const result = await getAllInvoices();

      // Lưu dữ liệu thô để xử lý lại khi chuyển tab
      setRawInvoices(result.results || []);
      processInvoiceData(timeRange, result.results || []);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu hóa đơn:", error);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý dữ liệu theo khoảng thời gian đã chọn
  const processInvoiceData = (range, invoices = rawInvoices) => {
    let processedData;

    switch (range) {
      case "week":
        processedData = getLastSevenDaysData(invoices);
        break;
      case "month":
        processedData = validateAndFixData(
          transformInvoiceData(invoices, "month")
        );
        break;
      case "year":
        processedData = validateAndFixData(
          transformInvoiceData(invoices, "year")
        );
        break;
      default:
        processedData = getLastSevenDaysData(invoices);
    }

    setData(processedData);
  };

  const validateAndFixData = (rawData) => {
    if (!rawData || !Array.isArray(rawData)) {
      return [];
    }

    return rawData.map((item) => ({
      ...item,
      // Đảm bảo giá trị không âm và là số
      onlineRevenue: Math.max(0, Number(item.onlineRevenue) || 0),
      restaurantRevenue: Math.max(0, Number(item.restaurantRevenue) || 0),
      orders: Math.max(0, Number(item.orders) || 0),
    }));
  };

  // Chuyển đổi dữ liệu hóa đơn thành định dạng cho biểu đồ
  const transformInvoiceData = (invoices, groupBy) => {
    const groupedData = new Map();

    invoices.forEach((invoice) => {
      const paymentDate = new Date(invoice.payment_time);
      let key;

      // Tạo khóa dựa trên loại nhóm thời gian
      switch (groupBy) {
        case "week":
          key = paymentDate.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
          break;
        case "month":
          key = paymentDate.toLocaleDateString("vi-VN", {
            month: "2-digit",
            year: "numeric",
          });
          break;
        case "year":
          key = paymentDate.getFullYear().toString();
          break;
      }

      // Khởi tạo nhóm nếu chưa có
      if (!groupedData.has(key)) {
        groupedData.set(key, {
          timeLabel: key,
          onlineRevenue: 0,
          restaurantRevenue: 0,
          orders: 0,
        });
      }

      const group = groupedData.get(key);

      // Phân loại doanh thu theo loại đơn hàng
      const orderType = invoice.order.orderType || "dine-in";
      if (orderType === "online") {
        group.onlineRevenue += invoice.final_amount;
      } else {
        group.restaurantRevenue += invoice.final_amount;
      }

      group.orders += 1;
    });

    // Chuyển Map thành mảng và sắp xếp theo thời gian
    return Array.from(groupedData.values()).sort((a, b) =>
      a.timeLabel.localeCompare(b.timeLabel)
    );
  };

  // Lấy dữ liệu 7 ngày gần nhất
  const getLastSevenDaysData = (invoices) => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6); // -6 để bao gồm cả ngày hiện tại (7 ngày)

    const filteredInvoices = invoices.filter((invoice) => {
      const paymentDate = new Date(invoice.payment_time);
      return paymentDate >= sevenDaysAgo && paymentDate <= today;
    });

    return validateAndFixData(transformInvoiceData(filteredInvoices, "week"));
  };

  // Chuẩn bị dữ liệu cho biểu đồ cột
  const getColumnData = (chartData) => {
    const result = [];
    chartData.forEach((item) => {
      result.push({
        timeLabel: item.timeLabel,
        type: "Đơn trực tuyến",
        value: item.onlineRevenue,
      });
      result.push({
        timeLabel: item.timeLabel,
        type: "Tại quán",
        value: item.restaurantRevenue,
      });
    });
    return result;
  };

  // Định dạng tiền tệ VNĐ
  const formatCurrency = (value, showSymbol = true) => {
    const formatter = new Intl.NumberFormat("vi-VN", {
      style: showSymbol ? "currency" : "decimal",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(value);
  };
  

  // Cấu hình biểu đồ
  const getDualAxesConfig = (chartData) => {
    const columnData = getColumnData(chartData);

    return {
      xField: "timeLabel",
      legend: true,
      children: [
        {
          // Cấu hình cho biểu đồ cột
          data: columnData,
          type: "interval",
          yField: "value",
          stack: true,
          colorField: "type",
          style: { maxWidth: 80 },
          label: {
            position: 'inside',
            text: "value",
            content: (item) => {
              if (item.type === "Tại quán") {
                const timeLabel = item.timeLabel;
                const totalRevenue = chartData.find(
                  (d) => d.timeLabel === timeLabel
                );
                if (totalRevenue) {
                  const total =
                    totalRevenue.onlineRevenue + totalRevenue.restaurantRevenue;
                  return formatCurrency(total, false);
                }
              }
              return "";
            },
            style: {
              fill: "#000",
              opacity: 0.6,
              fontSize: 12,
            },
          },
          scale: {
            y: {
              domainMin: 0,
              key: "key1",
              independent: false,
            },
          },
          interaction: {
            elementHighlight: {
              background: true,
            },
          },
          
        },
      ],
     
    };
  };

  const tabItems = [
    {
      key: "week",
      label: "7 ngày gần nhất",
      children: loading ? (
        <div className="chart-loading-container">
          <Spin size="large" />
        </div>
      ) : (
        <div
          style={{ height: 400, width: "100%", border: "1px solid #f0f0f0" }}
        >
          <Column {...getDualAxesConfig(data)} />
        </div>
      ),
    },
    {
      key: "month",
      label: "Theo tháng",
      children: loading ? (
        <div className="chart-loading-container">
          <Spin size="large" />
        </div>
      ) : (
        <div
          style={{ height: 400, width: "100%", border: "1px solid #f0f0f0" }}
        >
          <Column {...getDualAxesConfig(data)} />
        </div>
      ),
    },
    {
      key: "year",
      label: "Theo năm",
      children: loading ? (
        <div className="chart-loading-container">
          <Spin size="large" />
        </div>
      ) : (
        <div
          style={{ height: 400, width: "100%", border: "1px solid #f0f0f0" }}
        >
          <Column {...getDualAxesConfig(data)} />
        </div>
      ),
    },
  ];

  return (
    <Card className="revenue-chart-container">
      <Title level={4} className="chart-title">
        Thống kê doanh thu
      </Title>

      <Tabs defaultActiveKey="week" onChange={setTimeRange} items={tabItems} />
    </Card>
  );
};

export default RevenueChart;
