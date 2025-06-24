import { useState, useEffect } from "react";
import { Table, Button, Space, DatePicker, Select, Row, Col, Popconfirm, message, Tag } from "antd";
import { EyeOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import moment from "moment";
import { getImportInvoices, deleteImportInvoice } from "../../../services/importInvoiceServices";
import { getAllSuppliers } from "../../../services/supplierService";
import { useAuth } from "../../../components/context/authContext";

const { RangePicker } = DatePicker;
const { Option } = Select;

const ImportInvoiceList = ({ onViewInvoice }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    dateRange: null,
    supplier: null,
  });
  const [suppliers, setSuppliers] = useState([]);

  const { user } = useAuth();
  const isAdmin = user?.role.name === "admin";
  const isManager = user?.role.name === "manager";
  const canEditDelete = isAdmin || isManager;

  useEffect(() => {
    fetchInvoices();
    fetchSuppliers();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
      };

      if (filters.dateRange && filters.dateRange.length === 2) {
        params.startDate = filters.dateRange[0].format("YYYY-MM-DD");
        params.endDate = filters.dateRange[1].format("YYYY-MM-DD");
      }

      if (filters.supplier) {
        params.supplier = filters.supplier;
      }

      const response = await getImportInvoices(params);
      setInvoices(response.results || []);
      setPagination({
        ...pagination,
        total: response.totalResults || 0,
      });
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      message.error("Không thể tải danh sách phiếu nhập");
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await getAllSuppliers();
      setSuppliers(response.results || []);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const handleDateChange = (dates) => {
    setFilters({ ...filters, dateRange: dates });
    setPagination({ ...pagination, current: 1 });
  };

  const handleSupplierChange = (value) => {
    setFilters({ ...filters, supplier: value });
    setPagination({ ...pagination, current: 1 });
  };

  const resetFilters = () => {
    setFilters({
      dateRange: null,
      supplier: null,
    });
    setPagination({ ...pagination, current: 1 });
  };

  const handleDeleteInvoice = async (id) => {
    try {
      await deleteImportInvoice(id);
      message.success("Xóa phiếu nhập thành công");
      fetchInvoices();
    } catch (error) {
      console.error("Failed to delete invoice:", error);
      message.error("Không thể xóa phiếu nhập");
    }
  };

  const columns = [
    {
      title: "Mã phiếu",
      key: "id",
      render: (record) => <Tag color="blue">#{record.id.substring(record.id.length - 8).toUpperCase()}</Tag>,
    },
    {
      title: "Ngày nhập",
      dataIndex: "import_date",
      key: "import_date",
      render: (date) => moment(date).format("DD/MM/YYYY"),
      sorter: (a, b) => new Date(a.import_date) - new Date(b.import_date),
    },
    {
      title: "Nhà cung cấp",
      dataIndex: ["supplier", "name"],
      key: "supplier",
      render: (text) => text || "Không xác định",
    },
    {
      title: "Nhân viên",
      dataIndex: ["staff", "full_name"],
      key: "staff",
      render: (text) => text || "Không xác định",
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (amount) => `${(amount || 0).toLocaleString("vi-VN")} VND`,
      sorter: (a, b) => a.total_amount - b.total_amount,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Button type="primary" icon={<EyeOutlined />} onClick={() => onViewInvoice(record)} size="small" />

          {canEditDelete && (
            <Popconfirm
              title="Bạn có chắc muốn xóa phiếu nhập này?"
              onConfirm={() => handleDeleteInvoice(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button danger icon={<DeleteOutlined />} size="small" />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="import-invoice-list">
      <Row gutter={[16, 16]} className="filter-row">
        <Col span={7}>
          <RangePicker
            style={{ width: "100%" }}
            value={filters.dateRange}
            onChange={handleDateChange}
            format="DD/MM/YYYY"
            placeholder={["Từ ngày", "Đến ngày"]}
          />
        </Col>
        <Col span={7}>
          <Select
            key="supplier"
            style={{ width: "100%" }}
            placeholder="Chọn nhà cung cấp"
            allowClear
            value={filters.supplier}
            onChange={handleSupplierChange}
          >
            {suppliers.map((supplier) => (
              <Option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={2}>
          <Button icon={<ReloadOutlined />} onClick={resetFilters} title="Đặt lại bộ lọc" />
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={invoices}
        rowKey="id"
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default ImportInvoiceList;
