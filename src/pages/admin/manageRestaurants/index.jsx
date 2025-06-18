import  { useState, useEffect, useCallback } from 'react';
import { Table, Card, Button, Space, message, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { getRestaurants, deleteRestaurant } from '../../../services/restaurantServices';
import { useAuth } from '../../../components/context/authContext';
import ViewRestaurantModal from './ViewRestaurantModal';
import CreateRestaurantModal from './CreateRestaurantModal';
import EditRestaurantModal from './EditRestaurantModal';
import DeleteConfirmModal from './DeleteConfirmModal';

const ManageRestaurant = () => {
  const [restaurants, setRestaurants] = useState([]);
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
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  
  const { user } = useAuth();
  const isAdmin = user?.role?.name === 'admin';

  // Fetch restaurants data
  const fetchRestaurants = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = {
        page: params.page || pagination.current,
        limit: params.pageSize || pagination.pageSize,
        ...params,
      };

      const response = await getRestaurants(queryParams);
      
      setRestaurants(response.results);
      setPagination({
        ...pagination,
        current: parseInt(response.page) || 1,
        total: parseInt(response.totalResults) || 0,
      });
    } catch (error) {
      console.error('Lỗi khi tải danh sách nhà hàng:', error);
      message.error('Không thể tải danh sách nhà hàng');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  // Handle table pagination change
  const handleTableChange = (newPagination) => {
    fetchRestaurants({
      page: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  // Open view modal
  const handleViewRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setViewModalVisible(true);
  };

  // Open edit modal
  const handleEditRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setEditModalVisible(true);
  };

  // Open delete confirmation
  const handleDeleteClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setDeleteModalVisible(true);
  };

  // Confirm delete restaurant
  const handleDeleteConfirm = async () => {
    try {
      await deleteRestaurant(selectedRestaurant.id);
      message.success('Xóa nhà hàng thành công');
      setDeleteModalVisible(false);
      fetchRestaurants();
    } catch (error) {
      console.error('Lỗi khi xóa nhà hàng:', error);
      message.error('Không thể xóa nhà hàng');
    }
  };

  // Handle create success
  const handleCreateSuccess = () => {
    setCreateModalVisible(false);
    fetchRestaurants();
    message.success('Tạo nhà hàng thành công');
  };

  // Handle edit success
  const handleEditSuccess = () => {
    setEditModalVisible(false);
    fetchRestaurants();
    message.success('Cập nhật nhà hàng thành công');
  };

  // Table columns definition
  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: 'Tên nhà hàng',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'Hotline',
      dataIndex: 'hotline',
      key: 'hotline',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Giờ mở cửa',
      dataIndex: 'opening_hours',
      key: 'opening_hours',
      ellipsis: true,
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
              onClick={() => handleViewRestaurant(record)}
            />
          </Tooltip>
          
          {isAdmin && (
            <>
              <Tooltip title="Chỉnh sửa">
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => handleEditRestaurant(record)}
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
        title="Danh sách nhà hàng"
        extra={
          isAdmin && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              Thêm nhà hàng mới
            </Button>
          )
        }
      >
        <Table
          columns={columns}
          dataSource={restaurants}
          rowKey="id"
          pagination={{
            ...pagination,
            showTotal: (total) => `Tổng cộng ${total} nhà hàng`,
          }}
          loading={loading}
          onChange={handleTableChange}
          bordered
        />
      </Card>

      {/* Modal xem chi tiết */}
      <ViewRestaurantModal 
        visible={viewModalVisible}
        restaurant={selectedRestaurant}
        onCancel={() => setViewModalVisible(false)}
      />

      {/* Modal tạo mới - chỉ hiển thị cho admin */}
      {isAdmin && (
        <CreateRestaurantModal 
          visible={createModalVisible}
          onCancel={() => setCreateModalVisible(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Modal chỉnh sửa - chỉ hiển thị cho admin */}
      {isAdmin && (
        <EditRestaurantModal 
          visible={editModalVisible}
          restaurant={selectedRestaurant}
          onCancel={() => setEditModalVisible(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Modal xác nhận xóa - chỉ hiển thị cho admin */}
      {isAdmin && (
        <DeleteConfirmModal
          visible={deleteModalVisible}
          restaurant={selectedRestaurant}
          onCancel={() => setDeleteModalVisible(false)}
          onOk={handleDeleteConfirm}
        />
      )}
    </>
  );
};

export default ManageRestaurant;