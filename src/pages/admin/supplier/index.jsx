import { useState, useEffect, useCallback } from 'react';
import { Table, Card, Button, Space, Tooltip,  message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { getAllSuppliers, deleteSupplier } from '../../../services/supplierService';
import { useAuth } from '../../../components/context/authContext';

// Import modals
import ViewSupplierModal from './ViewSupplierModal';
import CreateSupplierModal from './CreateSupplierModal';
import EditSupplierModal from './EditSupplierModal';
import DeleteConfirmModal from './DeleteConfirmModal';

function Supplier() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  // Modal states
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  
  const { user } = useAuth();
  const isAdmin = user?.role?.name === 'admin';

  // Fetch suppliers data
  const fetchSuppliers = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = {
        page: params.page || pagination.current,
        limit: params.pageSize || pagination.pageSize,
        ...params,
      };

      const response = await getAllSuppliers(queryParams);
      
      setSuppliers(response.results);
      setPagination({
        ...pagination,
        current: parseInt(response.page) || 1,
        total: parseInt(response.totalResults) || 0,
      });
    } catch (error) {
      console.error('Lỗi khi tải danh sách nhà cung cấp:', error);
      message.error('Không thể tải danh sách nhà cung cấp');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, message]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Handle table pagination change
  const handleTableChange = (newPagination) => {
    fetchSuppliers({
      page: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  // Handle view supplier
  const handleViewSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setViewModalVisible(true);
  };

  // Handle edit supplier
  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setEditModalVisible(true);
  };

  // Open delete confirmation
  const handleDeleteClick = (supplier) => {
    setSelectedSupplier(supplier);
    setDeleteModalVisible(true);
  };

  // Confirm delete supplier
  const handleDeleteConfirm = async () => {
    try {
      await deleteSupplier(selectedSupplier.id);
      message.success('Xóa nhà cung cấp thành công');
      setDeleteModalVisible(false);
      fetchSuppliers();
    } catch (error) {
      console.error('Lỗi khi xóa nhà cung cấp:', error);
      message.error('Không thể xóa nhà cung cấp');
    }
  };

  // Handle create success
  const handleCreateSuccess = () => {
    setCreateModalVisible(false);
    fetchSuppliers();
    message.success('Tạo nhà cung cấp thành công');
  };

  // Handle edit success
  const handleEditSuccess = () => {
    setEditModalVisible(false);
    fetchSuppliers();
    message.success('Cập nhật nhà cung cấp thành công');
  };

  // Table columns
  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: 'Tên nhà cung cấp',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Người liên hệ',
      dataIndex: 'contact',
      key: 'contact',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewSupplier(record)}
            />
          </Tooltip>
          
          {isAdmin && (
            <>
              <Tooltip title="Chỉnh sửa">
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => handleEditSupplier(record)}
                />
              </Tooltip>
              
              <Tooltip title="Xóa">
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={() => handleDeleteClick(record)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title="Danh sách nhà cung cấp"
        extra={
          isAdmin && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              Thêm nhà cung cấp mới
            </Button>
          )
        }
      >
        <Table
          columns={columns}
          dataSource={suppliers}
          rowKey="id"
          pagination={{
            ...pagination,
            showTotal: (total) => `Tổng cộng ${total} nhà cung cấp`,
          }}
          loading={loading}
          onChange={handleTableChange}
          bordered
        />
      </Card>

      {/* Modal xem chi tiết */}
      <ViewSupplierModal 
        visible={viewModalVisible}
        supplier={selectedSupplier}
        onCancel={() => setViewModalVisible(false)}
      />

      {/* Modal tạo mới - chỉ hiển thị cho admin */}
      {isAdmin && (
        <CreateSupplierModal 
          visible={createModalVisible}
          onCancel={() => setCreateModalVisible(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Modal chỉnh sửa - chỉ hiển thị cho admin */}
      {isAdmin && (
        <EditSupplierModal 
          visible={editModalVisible}
          supplier={selectedSupplier}
          onCancel={() => setEditModalVisible(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Modal xác nhận xóa - chỉ hiển thị cho admin */}
      {isAdmin && (
        <DeleteConfirmModal
          visible={deleteModalVisible}
          supplier={selectedSupplier}
          onCancel={() => setDeleteModalVisible(false)}
          onOk={handleDeleteConfirm}
        />
      )}
    </>
  );
}

export default Supplier;