import { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { createTable } from '../../../services/tableService';
import { getRestaurants } from '../../../services/restaurantServices';
import { useAuth } from '../../../components/context/authContext';

const { Option } = Select;

const CreateTableModal = ({ visible, onCancel, onSuccess, isAdmin }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  
  const { user } = useAuth();
  const userRestaurantId = user?.restaurant?.id;

  // Reset form and fetch data when modal opens
  useEffect(() => {
    if (visible) {
      form.resetFields();
      
      if (isAdmin) {
        fetchRestaurants();
      } else if (userRestaurantId) {
        // If manager, set their restaurant as default
        form.setFieldsValue({ restaurant: userRestaurantId });
      }
    }
  }, [visible, form, isAdmin, userRestaurantId]);

  // Fetch restaurants for admin
  const fetchRestaurants = async () => {
    try {
      const response = await getRestaurants();
      setRestaurants(response.results || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách nhà hàng:', error);
      message.error('Không thể tải danh sách nhà hàng');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // If manager, always use their restaurant
      if (!isAdmin && userRestaurantId) {
        values.restaurant = userRestaurantId;
      }
      
      await createTable(values);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Lỗi khi tạo bàn:', error);
      message.error('Không thể tạo bàn: ' + (error.response?.data?.message || 'Đã có lỗi xảy ra'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Thêm bàn mới"
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="Tạo"
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          capacity: 4,
          status: 'available'
        }}
      >
        <Form.Item
          name="name"
          label="Tên bàn"
          rules={[{ required: true, message: 'Vui lòng nhập tên bàn!' }]}
        >
          <Input placeholder="Ví dụ: Bàn 01, VIP 01..." />
        </Form.Item>

        <Form.Item
          name="capacity"
          label="Sức chứa"
          rules={[{ required: true, message: 'Vui lòng nhập sức chứa!' }]}
        >
          <InputNumber 
            min={1} 
            max={20}
            style={{ width: '100%' }}
            placeholder="Số người" 
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="Trạng thái"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
        >
          <Select>
            <Option value="available">Sẵn sàng</Option>
            <Option value="maintenance">Bảo trì</Option>
          </Select>
        </Form.Item>

        {isAdmin && (
          <Form.Item
            name="restaurant"
            label="Nhà hàng"
            rules={[{ required: true, message: 'Vui lòng chọn nhà hàng!' }]}
          >
            <Select placeholder="Chọn nhà hàng">
              {restaurants.map(restaurant => (
                <Option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default CreateTableModal;