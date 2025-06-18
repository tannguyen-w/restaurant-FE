import { useState, useEffect, useCallback } from 'react';
import { Table, Card, Button, Space, Tag, Image, Tooltip, Select, Input, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { getDishes, deleteDish } from '../../../services/dishService';
import { getRestaurants } from '../../../services/restaurantServices';
import { getDishCategories } from '../../../services/dishCategoryService';
import { useAuth } from '../../../components/context/authContext';

// Import components
import ViewDishModal from './ViewDishModal';
import CreateDishModal from './CreateDishModal';
import EditDishModal from './EditDishModal';
import DeleteConfirmModal from './DeleteConfirmModal';

const { Option } = Select;

const ManageDish = () => {
  const [dishes, setDishes] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  // Filters
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchText, setSearchText] = useState('');
  
  // Modal states
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  
  const { user } = useAuth();
  const isAdmin = user?.role?.name === 'admin';
  const isManager = user?.role?.name === 'manager';
  const userRestaurantId = isManager ? user?.restaurant?.id : null;

  // Fetch dishes data
  const fetchDishes = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = {
        page: params.page || pagination.current,
        limit: params.pageSize || pagination.pageSize,
        ...params,
      };

      // Apply filters
      if (params.restaurant) {
        queryParams.restaurant = params.restaurant;
      } 
      else if (isManager && userRestaurantId) {
        queryParams.restaurant = userRestaurantId;
      } 
      else if (selectedRestaurant) {
        queryParams.restaurant = selectedRestaurant;
      }

      if (params.category || selectedCategory) {
        queryParams.category = params.category || selectedCategory;
      }

      if (params.name || searchText) {
        queryParams.name = params.name || searchText;
      }

      const response = await getDishes(queryParams);
      
      setDishes(response.results);
      setPagination({
        ...pagination,
        current: parseInt(response.page) || 1,
        total: parseInt(response.totalResults) || 0,
      });
    } catch (error) {
      console.error('Lỗi khi tải danh sách món ăn:', error);
      message.error('Không thể tải danh sách món ăn');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, selectedRestaurant, selectedCategory, searchText]);

  // Fetch restaurants and categories
  const fetchFilters = useCallback(async () => {
    try {
     const categoriesPromise = getDishCategories();
      let restaurantsPromise = Promise.resolve({ results: [] });
      
      if (isAdmin) {
        restaurantsPromise = getRestaurants();
      }
      
      const [categoriesData, restaurantsData] = await Promise.all([
        categoriesPromise, 
        restaurantsPromise
      ]);
      
        setCategories(categoriesData.results || []);
      
      if (isAdmin) {
        setRestaurants(restaurantsData.results || []);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu bộ lọc:', error);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchDishes();
    fetchFilters();
  }, [fetchDishes, fetchFilters]);

  // Handle table pagination change
  const handleTableChange = (newPagination) => {
    fetchDishes({
      page: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  // Handle restaurant filter change
  const handleRestaurantChange = (value) => {
    setSelectedRestaurant(value);
    fetchDishes({ restaurant: value, page: 1 });
    setPagination({ ...pagination, current: 1 });
  };

  // Handle category filter change
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    fetchDishes({ category: value, page: 1 });
    setPagination({ ...pagination, current: 1 });
  };

  // Handle search
  const handleSearch = () => {
    fetchDishes({ name: searchText, page: 1 });
    setPagination({ ...pagination, current: 1 });
  };

  // Handle view dish
  const handleViewDish = (dish) => {
    setSelectedDish(dish);
    setViewModalVisible(true);
  };

  // Handle edit dish
  const handleEditDish = (dish) => {
    setSelectedDish(dish);
    setEditModalVisible(true);
  };

  // Open delete confirmation
  const handleDeleteClick = (dish) => {
    setSelectedDish(dish);
    setDeleteModalVisible(true);
  };

  // Confirm delete dish
  const handleDeleteConfirm = async () => {
    try {
      await deleteDish(selectedDish.id);
      message.success('Xóa món ăn thành công');
      setDeleteModalVisible(false);
      fetchDishes();
    } catch (error) {
      console.error('Lỗi khi xóa món ăn:', error);
      message.error('Không thể xóa món ăn');
    }
  };

  // Handle create success
  const handleCreateSuccess = () => {
    setCreateModalVisible(false);
    fetchDishes();
    message.success('Tạo món ăn mới thành công');
  };

  // Handle edit success
  const handleEditSuccess = () => {
    setEditModalVisible(false);
    fetchDishes();
    message.success('Cập nhật món ăn thành công');
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
      title: 'Hình ảnh',
      dataIndex: 'images',
      key: 'image',
      width: 100,
      render: (images) => (
        images && images.length > 0 ? (
          <Image 
            width={80} 
            height={80}
            style={{ objectFit: 'cover' }}
            src={images[0]} 
            alt="Món ăn"
            placeholder={
              <div style={{ width: 80, height: 80, background: '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                Đang tải...
              </div>
            }
            fallback="data:image/png;base64,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"
          />
        ) : (
          <div style={{ width: 80, height: 80, background: '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            Không có ảnh
          </div>
        )
      ),
    },
    {
      title: 'Tên món',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => price ? `${price.toLocaleString('vi-VN')} VNĐ` : 'N/A',
    },
    {
      title: 'Loại',
      dataIndex: 'isCombo',
      key: 'isCombo',
      render: (isCombo) => (
        isCombo ? <Tag color="purple">Combo</Tag> : <Tag color="blue">Đơn lẻ</Tag>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: ['category', 'name'],
      key: 'category',
      render: (text) => text || 'Chưa phân loại',
    },
    {
      title: 'Nhà hàng',
      dataIndex: ['restaurant', 'name'],
      key: 'restaurant',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => {
        const isOwner = isManager && record.restaurant?.id === userRestaurantId;
        return (
          <Space>
            <Tooltip title="Xem chi tiết">
              <Button
                icon={<EyeOutlined />}
                size="small"
                onClick={() => handleViewDish(record)}
              />
            </Tooltip>
            
            {(isAdmin || isOwner) && (
              <>
                <Tooltip title="Chỉnh sửa">
                  <Button
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => handleEditDish(record)}
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
        );
      },
    },
  ];

  return (
    <>
      <Card
        title="Danh sách món ăn"
        extra={
          <Space>
            {isAdmin && (
              <Select
                placeholder="Lọc theo nhà hàng"
                style={{ width: 180 }}
                allowClear
                onChange={handleRestaurantChange}
                value={selectedRestaurant}
              >
                {restaurants.map(restaurant => (
                  <Option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </Option>
                ))}
              </Select>
            )}
            
            <Select
              placeholder="Lọc theo danh mục"
              style={{ width: 180 }}
              allowClear
              onChange={handleCategoryChange}
              value={selectedCategory}
            >
              {categories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
            
            <Input
              placeholder="Tìm kiếm theo tên"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 200 }}
              suffix={
                <Button type="text" icon={<SearchOutlined />} onClick={handleSearch} />
              }
            />
            
            {(isAdmin || isManager) && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalVisible(true)}
              >
                Thêm món ăn mới
              </Button>
            )}
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={dishes}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} món ăn`,
          }}
          loading={loading}
          onChange={handleTableChange}
          bordered
        />
      </Card>

      {/* Modal xem chi tiết */}
      <ViewDishModal 
        visible={viewModalVisible}
        dish={selectedDish}
        onCancel={() => setViewModalVisible(false)}
      />

      {/* Modal tạo mới - chỉ hiển thị cho admin hoặc manager */}
      {(isAdmin || isManager) && (
        <CreateDishModal 
          visible={createModalVisible}
          onCancel={() => setCreateModalVisible(false)}
          onSuccess={handleCreateSuccess}
          isAdmin={isAdmin}
        />
      )}

      {/* Modal chỉnh sửa - chỉ hiển thị cho admin hoặc manager */}
      {(isAdmin || isManager) && (
        
        <EditDishModal 
          visible={editModalVisible}
          
          dishId={selectedDish}
          onCancel={() => setEditModalVisible(false)}
          onSuccess={handleEditSuccess}
          isAdmin={isAdmin}
        />
      )}

      {/* Modal xác nhận xóa - chỉ hiển thị cho admin hoặc manager */}
      {(isAdmin || isManager) && (
        <DeleteConfirmModal
          visible={deleteModalVisible}
          dish={selectedDish}
          onCancel={() => setDeleteModalVisible(false)}
          onOk={handleDeleteConfirm}
        />
      )}
    </>
  );
};

export default ManageDish;