import { useState, useEffect } from 'react';
import {
  Card,
  DatePicker,
  Button,
  Table,
  Select,
  Row,
  Col,
  Statistic
} from 'antd';
import {
  ReloadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { getImportInvoices } from '../../../services/importInvoiceServices';
import { exportToExcel } from '../../../utils/exportUtils';

const { RangePicker } = DatePicker;
const { Option } = Select;

const InventoryReport = () => {
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [dateRange, setDateRange] = useState([moment().subtract(30, 'days'), moment()]);
  const [reportType, setReportType] = useState('supplier');
  const [reportData, setReportData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (dateRange && dateRange.length === 2) {
      generateReport();
    }
  }, [reportType, dateRange]);

  const generateReport = async () => {
    if (!dateRange || dateRange.length !== 2) return;

    setLoading(true);
    try {
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');

      // Get all invoices within date range (no pagination for report)
      const response = await getImportInvoices({
        startDate,
        endDate,
        limit: 1000
      });

      const invoices = response.results || [];
      
      if (invoices.length === 0) {
        setReportData([]);
        setTotalAmount(0);
        setTotalCount(0);
        return;
      }

      // Calculate totals
      const total = invoices.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
      setTotalAmount(total);
      setTotalCount(invoices.length);

      let groupedData = [];

      if (reportType === 'supplier') {
        // Group by supplier
        const supplierMap = new Map();

        invoices.forEach(invoice => {
          if (!invoice.supplier) return;

          const supplierId = invoice.supplier.id;
          const supplierName = invoice.supplier.name || 'Không xác định';

          if (!supplierMap.has(supplierId)) {
            supplierMap.set(supplierId, {
              key: supplierId,
              name: supplierName,
              count: 0,
              totalAmount: 0
            });
          }

          const data = supplierMap.get(supplierId);
          data.count += 1;
          data.totalAmount += invoice.total_amount || 0;
        });

        groupedData = Array.from(supplierMap.values());
        groupedData.sort((a, b) => b.totalAmount - a.totalAmount);
      } 
      else if (reportType === 'date') {
        // Group by date
        const dateMap = new Map();

        invoices.forEach(invoice => {
          const date = moment(invoice.import_date).format('YYYY-MM-DD');

          if (!dateMap.has(date)) {
            dateMap.set(date, {
              key: date,
              date: date,
              count: 0,
              totalAmount: 0
            });
          }

          const data = dateMap.get(date);
          data.count += 1;
          data.totalAmount += invoice.total_amount || 0;
        });

        groupedData = Array.from(dateMap.values());
        groupedData.sort((a, b) => moment(a.date).diff(moment(b.date)));
      }

      setReportData(groupedData);
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (reportData.length === 0) return;

    setExportLoading(true);
    try {
      const fileName = `Bao_cao_nhap_kho_${moment().format('DDMMYYYY')}`;
      let data = [];

      if (reportType === 'supplier') {
        data = reportData.map((item, index) => ({
          'STT': index + 1,
          'Nhà cung cấp': item.name,
          'Số lượng phiếu nhập': item.count,
          'Tổng tiền': `${item.totalAmount.toLocaleString('vi-VN')} VND`,
        }));
      } else {
        data = reportData.map((item, index) => ({
          'STT': index + 1,
          'Ngày': moment(item.date).format('DD/MM/YYYY'),
          'Số lượng phiếu nhập': item.count,
          'Tổng tiền': `${item.totalAmount.toLocaleString('vi-VN')} VND`,
        }));
      }

      await exportToExcel(data, fileName, `Báo cáo nhập kho từ ${dateRange[0].format('DD/MM/YYYY')} đến ${dateRange[1].format('DD/MM/YYYY')}`);
    } catch (error) {
      console.error('Failed to export report:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const columns = reportType === 'supplier' ? [
    {
      title: 'STT',
      key: 'index',
      width: '5%',
      render: (_, record, index) => index + 1,
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số lượng phiếu nhập',
      dataIndex: 'count',
      key: 'count',
      sorter: (a, b) => a.count - b.count,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: amount => `${amount.toLocaleString('vi-VN')} VND`,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    }
  ] : [
    {
      title: 'STT',
      key: 'index',
      width: '5%',
      render: (_, record, index) => index + 1,
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: date => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.date).diff(moment(b.date)),
    },
    {
      title: 'Số lượng phiếu nhập',
      dataIndex: 'count',
      key: 'count',
      sorter: (a, b) => a.count - b.count,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: amount => `${amount.toLocaleString('vi-VN')} VND`,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    }
  ];

  return (
    <div className="inventory-report">
      <Card title="Báo cáo nhập kho">
        <Row gutter={[16, 16]} className="filter-row">
          <Col span={8}>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={setDateRange}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col span={8}>
            <Select
              style={{ width: '100%' }}
              value={reportType}
              onChange={setReportType}
            >
              <Option value="supplier">Theo nhà cung cấp</Option>
              <Option value="date">Theo ngày</Option>
            </Select>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={generateReport}
              loading={loading}
              style={{ marginRight: 8 }}
            >
              Tạo báo cáo
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
              disabled={reportData.length === 0}
              loading={exportLoading}
            >
              Xuất Excel
            </Button>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 16, marginBottom: 16 }}>
          <Col span={12}>
            <Statistic
              title="Tổng số phiếu nhập"
              value={totalCount}
              suffix="phiếu"
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Tổng tiền nhập kho"
              value={totalAmount}
              formatter={value => `${value.toLocaleString('vi-VN')} VND`}
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={reportData}
          rowKey="key"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default InventoryReport;