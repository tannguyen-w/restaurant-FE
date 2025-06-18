import  { useState, useEffect } from 'react';
import { getImportInvoices } from "../../../services/importInvoiceServices";
import { getImportInvoiceDetailByInvoiceId } from "../../../services/importInvoiceDetailServices";

import { Table, Card, Button,  message, Drawer, Tooltip } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import moment from 'moment';
import CreateImportInvoiceModal from './CreateImportInvoiceModal';

const WarehouseAdd = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchInvoices = async (params = {}) => {
    setLoading(true);
    try {
      const response = await getImportInvoices({
        page: params.page || pagination.current,
        limit: params.pageSize || pagination.pageSize,
        ...params,
      });

      setData(response.results);
      setPagination({
        ...pagination,
        current: response.page,
        total: response.totalResults,
      });
    } catch (error) {
      console.error('Lỗi khi tải danh sách phiếu nhập:', error);
      message.error('Không thể tải danh sách phiếu nhập');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [pagination.current]);

  const handleTableChange = (newPagination, filters, sorter) => {
    fetchInvoices({
      page: newPagination.current,
      pageSize: newPagination.pageSize,
      sortField: sorter.field,
      sortOrder: sorter.order,
    });
  };

  const handleCreateSuccess = () => {
    setCreateModalVisible(false);
    message.success('Tạo phiếu nhập thành công!');
    fetchInvoices();
  };

  const showInvoiceDetails = async (invoice) => {
    setSelectedInvoice(invoice);
    setDetailDrawerVisible(true);
    setDetailsLoading(true);
    
    try {
      const response = await getImportInvoiceDetailByInvoiceId(invoice.id);
      setInvoiceDetails(response);
    } catch (error) {
      console.error('Lỗi khi tải chi tiết phiếu nhập:', error);
      message.error('Không thể tải chi tiết phiếu nhập');
    } finally {
      setDetailsLoading(false);
    }
  };

  const columns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => (
        <Button type="link" onClick={() => showInvoiceDetails(record)}>
          {text.slice(-8).toUpperCase()}
        </Button>
      ),
    },
    {
      title: 'Ngày nhập',
      dataIndex: 'import_date',
      key: 'import_date',
      render: (text) => moment(text).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: ['supplier', 'name'],
      key: 'supplier',
      render: (text) => text || 'Không xác định',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (text) => text ? text.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '0 đ',
    },
    {
      title: 'Nhân viên',
      dataIndex: ['staff', 'name'],
      key: 'staff',
      render: (text, record) => text || (record.staff?.full_name || 'Không xác định'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => showInvoiceDetails(record)}
          />
        </Tooltip>
      ),
    },
  ];

  const detailColumns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Nguyên liệu',
      dataIndex: ['ingredient', 'name'],
      key: 'ingredient',
    },
    {
      title: 'Đơn vị',
      dataIndex: ['ingredient', 'unit'],
      key: 'unit',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unit_price',
      key: 'unit_price',
      render: (text) => text ? text.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '0 đ',
    },
    {
      title: 'Thành tiền',
      key: 'amount',
      render: (_, record) => {
        const amount = record.quantity * record.unit_price;
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
      },
    },
  ];
  return (
    <div>
      <h1 className="staff-content__header">Nhập nguyên liệu</h1>
      
      <>
      <Card
        title="Danh sách phiếu nhập"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Tạo phiếu nhập
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          bordered
        />
      </Card>

      <CreateImportInvoiceModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      <Drawer
        title={
          <div>
            <div>Chi tiết phiếu nhập #{selectedInvoice?.id.slice(-8).toUpperCase()}</div>
            <div style={{ fontSize: '12px', fontWeight: 'normal', marginTop: '4px' }}>
              {selectedInvoice && moment(selectedInvoice.import_date).format('DD/MM/YYYY HH:mm')}
            </div>
          </div>
        }
        width={800}
        onClose={() => setDetailDrawerVisible(false)}
        open={detailDrawerVisible}
      >
        {selectedInvoice && (
          <>
            <div style={{ marginBottom: 16 }}>
              <p><strong>Nhà cung cấp:</strong> {selectedInvoice.supplier?.name || 'Không xác định'}</p>
              <p><strong>Nhân viên:</strong> {selectedInvoice.staff?.name || selectedInvoice.staff?.username || 'Không xác định'}</p>
              <p><strong>Tổng tiền:</strong> {selectedInvoice.total_amount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || '0 đ'}</p>
            </div>
            <Table
              columns={detailColumns}
              dataSource={invoiceDetails}
              rowKey="id"
              pagination={false}
              loading={detailsLoading}
              bordered
              summary={(pageData) => {
                const totalAmount = pageData.reduce(
                  (sum, item) => sum + (item.quantity * item.unit_price || 0),
                  0
                );
                
                return (
                  <>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={5} align="right">
                        <strong>Tổng cộng:</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <strong>{totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </>
                );
              }}
            />
          </>
        )}
      </Drawer>
    </>
    </div>
  );
}

export default WarehouseAdd;