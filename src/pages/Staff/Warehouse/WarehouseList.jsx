import { useState, useEffect } from "react";
import { getAllIngredients } from "../../../services/ingredientServices";
import { Button, Card, Space, Table, Tag, Input, Select } from "antd";
import { ExportOutlined, SearchOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";

const { Option } = Select;

const WarehouseList = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const pageSize = 10;

  // Gọi API chỉ một lần để lấy tất cả dữ liệu
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Tải tất cả dữ liệu (hoặc số lượng lớn hơn)
        const params = { limit: 1000 }; // Giả sử không quá 1000 nguyên liệu
        const response = await getAllIngredients(params);
        
        setData(response.results || []);
        setFilteredData(response.results || []);
        setTotalResults(response.totalResults || 0);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Tìm kiếm và lọc trên client-side
  useEffect(() => {
    let results = [...data];
    
    // Lọc theo tên
    if (searchText) {
      results = results.filter(item => 
        item.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // Lọc theo danh mục
    if (selectedCategory) {
      results = results.filter(item => 
        item.category?.name === selectedCategory
      );
    }
    
    setFilteredData(results);
    setTotalResults(results.length);
    setCurrentPage(1); // Reset về trang đầu khi thay đổi bộ lọc
  }, [searchText, selectedCategory, data]);

  // Xử lý tìm kiếm
  const handleSearch = (value) => {
    setSearchText(value);
  };

  // Xử lý thay đổi danh mục
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  // Lấy dữ liệu hiển thị cho trang hiện tại
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  };

  // Định nghĩa màu cho từng loại nguyên liệu
  const getCategoryColor = (categoryName) => {
    const categoryColors = {
      "Gia vị": "green",
      "Đồ khô - Nguyên liệu chế biến sẵn": "gold",
      "Đồ đông lạnh": "blue",
      "Khác (bao bì, dụng cụ, ...)": "purple",
      "Thịt - Thủy - Hải Sản": "red",
      "Rau - Củ - Quả (tươi)": "orange",
    };

    return categoryColors[categoryName] || "default";
  };

  // Xuất dữ liệu ra file Excel
  const exportToExcel = () => {
    const exportData = filteredData.map((item, index) => ({
      STT: index + 1,
      "Tên nguyên liệu": item.name,
      "Đơn vị": item.unit,
      "Số lượng": item.current_stock,
      "Loại nguyên liệu": item.category?.name || "Không xác định",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Nguyên liệu");
    XLSX.writeFile(workbook, "danh-sach-nguyen-lieu.xlsx");
  };

  // Danh sách các loại nguyên liệu
  const categoryOptions = [
    { text: "Gia vị", value: "Gia vị" },
    { text: "Đồ khô - Nguyên liệu chế biến sẵn", value: "Đồ khô - Nguyên liệu chế biến sẵn" },
    { text: "Đồ đông lạnh", value: "Đồ đông lạnh" },
    { text: "Rau - Củ - Quả (tươi)", value: "Rau - Củ - Quả (tươi)" },
    { text: "Thịt - Thủy - Hải Sản", value: "Thịt - Thủy - Hải Sản" },
    { text: "Khác (bao bì, dụng cụ, ...)", value: "Khác (bao bì, dụng cụ, ...)" },
  ];

  // Định nghĩa các cột của bảng
  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Tên nguyên liệu",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Số lượng",
      dataIndex: "current_stock",
      key: "current_stock",
      width: 120,
      
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
      width: 100,
    },
    
    {
      title: "Loại nguyên liệu",
      dataIndex: ["category", "name"],
      key: "category",
      width: 280,
      render: (categoryName) => {
        if (!categoryName) return <Tag color="default">Không xác định</Tag>;
        return <Tag color={getCategoryColor(categoryName)}>{categoryName}</Tag>;
      },
    },
  ];

  return (
    <div>
      <Card title="Danh sách nguyên liệu">
        <Space style={{ marginBottom: 16 }} size="middle" wrap>
          {/* Component tìm kiếm */}
          <Input
            placeholder="Tìm kiếm theo tên nguyên liệu"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            prefix={<SearchOutlined />}
            allowClear
            style={{ width: 300 }}
          />

          {/* Component lọc theo danh mục */}
          <Select
            placeholder="Lọc theo loại nguyên liệu"
            style={{ width: 250 }}
            onChange={handleCategoryChange}
            value={selectedCategory}
            allowClear
          >
            {categoryOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.text}
              </Option>
            ))}
          </Select>

          <Button
            type="primary"
            icon={<ExportOutlined />}
            onClick={exportToExcel}
          >
            Xuất Excel
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={getCurrentPageData()}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalResults,
            showSizeChanger: false,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} nguyên liệu`,
            onChange: (page) => {
              setCurrentPage(page);
            },
          }}
          loading={loading}
          bordered
        />
      </Card>
    </div>
  );
};

export default WarehouseList;