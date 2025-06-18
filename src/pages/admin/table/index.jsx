import  { useState, useEffect, useCallback } from 'react';
import { Table, Card, Button, Space, Tooltip,  Select, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { getAllTables, deleteTable } from '../../../services/tableService';
import { getRestaurants } from '../../../services/restaurantServices';
import { useAuth } from '../../../components/context/authContext';

// Import components
import ViewTableModal from './ViewTableModal';
import CreateTableModal from './CreateTableModal';
import EditTableModal from './EditTableModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import StatusTag from './StatusTag';

const { Option } = Select;

const ManageTable = () => {
  const [tables, setTables] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  // Filters
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  
  // Modal states
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  
  const { user } = useAuth();
  const isAdmin = user?.role?.name === 'admin';
  const isManager = user?.role?.name === 'manager';
  const userRestaurantId = isManager ? user?.restaurant?.id : null;

  // Fetch tables data
  const fetchTables = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = {
        page: params.page || pagination.current,
        limit: params.pageSize || pagination.pageSize,
        ...params,
      };

       // Nếu có restaurant trong params thì sử dụng nó (cho trường hợp filter)
      if (params.restaurant) {
        queryParams.restaurant = params.restaurant;
      }
      // Nếu không, áp dụng logic phân quyền
      else if (isManager && userRestaurantId) {
        queryParams.restaurant = userRestaurantId;
      } 
      else if (selectedRestaurant) {
        queryParams.restaurant = selectedRestaurant;
      }

      const response = await getAllTables(queryParams);
      
      setTables(response.results);
      setPagination({
        ...pagination,
        current: parseInt(response.page) || 1,
        total: parseInt(response.totalResults) || 0,
      });
    } catch (error) {
      console.error('Lỗi khi tải danh sách bàn:', error);
      message.error('Không thể tải danh sách bàn');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, selectedRestaurant]);

  // Fetch restaurants for filter dropdown
  const fetchRestaurants = useCallback(async () => {
    try {
      if (!isAdmin) return;
      
      const response = await getRestaurants();
      setRestaurants(response.results || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách nhà hàng:', error);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchTables();
    fetchRestaurants();
  }, [fetchTables, fetchRestaurants]);

  // Handle table pagination change
  const handleTableChange = (newPagination) => {
    fetchTables({
      page: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  // Handle restaurant filter change
  const handleRestaurantChange = (value) => {
    setSelectedRestaurant(value);
    setPagination({ ...pagination, current: 1 });
    fetchTables({ restaurant: value, page: 1 });
  };

  // Handle view table
  const handleViewTable = (table) => {
    setSelectedTable(table);
    setViewModalVisible(true);
  };

  // Handle edit table
  const handleEditTable = (table) => {
    setSelectedTable(table);
    setEditModalVisible(true);
  };

  // Open delete confirmation
  const handleDeleteClick = (table) => {
    setSelectedTable(table);
    setDeleteModalVisible(true);
  };

  // Confirm delete table
  const handleDeleteConfirm = async () => {
    try {
      await deleteTable(selectedTable.id);
      message.success('Xóa bàn thành công');
      setDeleteModalVisible(false);
      fetchTables();
    } catch (error) {
      console.error('Lỗi khi xóa bàn:', error);
      message.error('Không thể xóa bàn');
    }
  };

  // Handle create success
  const handleCreateSuccess = () => {
    setCreateModalVisible(false);
    fetchTables();
    message.success('Tạo bàn mới thành công');
  };

  // Handle edit success
  const handleEditSuccess = () => {
    setEditModalVisible(false);
    fetchTables();
    message.success('Cập nhật bàn thành công');
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
      title: 'Tên bàn',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Sức chứa',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (capacity) => `${capacity} người`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusTag status={status} />,
    },
    {
      title: 'Nhà hàng',
      dataIndex: ['restaurant', 'name'],
      key: 'restaurant',
      render: (name) => name || 'N/A',
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
              onClick={() => handleViewTable(record)}
            />
          </Tooltip>
          
          {(isAdmin || (isManager && record.restaurant?.id === userRestaurantId)) && (
            <>
              <Tooltip title="Chỉnh sửa">
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => handleEditTable(record)}
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
        title="Danh sách bàn"
        extra={
          <>
            {isAdmin && (
              <Space>
                <Select
                  placeholder="Lọc theo nhà hàng"
                  value={selectedRestaurant}
                  style={{ width: 200 }}
                  allowClear
                  onChange={handleRestaurantChange}
                >
                  {restaurants.map(restaurant => (
                    <Option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </Option>
                  ))}
                </Select>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateModalVisible(true)}
                >
                  Thêm bàn mới
                </Button>
              </Space>
            )}
            {isManager && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalVisible(true)}
              >
                Thêm bàn mới
              </Button>
            )}
          </>
        }
      >
        <Table
          columns={columns}
          dataSource={tables}
          rowKey="id"
          pagination={{
            ...pagination,
            showTotal: (total) => `Tổng cộng ${total} bàn`,
          }}
          loading={loading}
          onChange={handleTableChange}
          bordered
        />
      </Card>

      {/* Modal xem chi tiết */}
      <ViewTableModal 
        visible={viewModalVisible}
        table={selectedTable}
        onCancel={() => setViewModalVisible(false)}
      />

      {/* Modal tạo mới - chỉ hiển thị cho admin hoặc manager */}
      {(isAdmin || isManager) && (
        <CreateTableModal 
          visible={createModalVisible}
          onCancel={() => setCreateModalVisible(false)}
          onSuccess={handleCreateSuccess}
          isAdmin={isAdmin}
        />
      )}

      {/* Modal chỉnh sửa - chỉ hiển thị cho admin hoặc manager */}
      {(isAdmin || isManager) && (
        <EditTableModal 
          visible={editModalVisible}
          table={selectedTable}
          onCancel={() => setEditModalVisible(false)}
          onSuccess={handleEditSuccess}
          isAdmin={isAdmin}
        />
      )}

      {/* Modal xác nhận xóa - chỉ hiển thị cho admin hoặc manager */}
      {(isAdmin || isManager) && (
        <DeleteConfirmModal
          visible={deleteModalVisible}
          table={selectedTable}
          onCancel={() => setDeleteModalVisible(false)}
          onOk={handleDeleteConfirm}
        />
      )}
    </>
  );
};

export default ManageTable;