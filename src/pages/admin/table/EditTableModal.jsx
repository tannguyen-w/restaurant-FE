import  { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { updateTable } from '../../../services/tableService';
import { getRestaurants } from '../../../services/restaurantServices';

const { Option } = Select;

const EditTableModal = ({ visible, table, onCancel, onSuccess, isAdmin }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState([]);

  // Fetch restaurants and set form values when modal opens
  useEffect(() => {
    if (visible && table) {
      form.setFieldsValue({
        name: table.name,
        capacity: table.capacity,
        status: table.status,
        restaurant: table.restaurant?.id,
      });
      
      if (isAdmin) {
        fetchRestaurants();
      }
    }
  }, [visible, table, form, isAdmin]);

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
    if (!table) return;
    
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // If not admin, remove restaurant field to prevent changes
      if (!isAdmin) {
        delete values.restaurant;
      }
      
      await updateTable(table.id, values);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật bàn:', error);
      message.error('Không thể cập nhật bàn: ' + (error.response?.data?.message || 'Đã có lỗi xảy ra'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Chỉnh sửa bàn"
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
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

export default EditTableModal;