import { useState, useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { updateRestaurant } from '../../../services/restaurantServices';

const EditRestaurantModal = ({ visible, restaurant, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Cập nhật form khi có dữ liệu nhà hàng mới
  useEffect(() => {
    if (visible && restaurant) {
      form.setFieldsValue({
        name: restaurant.name,
        address: restaurant.address,
        hotline: restaurant.hotline,
        email: restaurant.email,
        opening_hours: restaurant.opening_hours,
      });
    }
  }, [visible, restaurant, form]);

  const handleSubmit = async () => {
    if (!restaurant) return;
    
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      await updateRestaurant(restaurant.id, values);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật nhà hàng:', error);
      message.error('Không thể cập nhật nhà hàng: ' + (error.response?.data?.message || 'Đã có lỗi xảy ra'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Chỉnh sửa nhà hàng"
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
          label="Tên nhà hàng"
          rules={[{ required: true, message: 'Vui lòng nhập tên nhà hàng!' }]}
        >
          <Input placeholder="Nhập tên nhà hàng" />
        </Form.Item>

        <Form.Item
          name="address"
          label="Địa chỉ"
        >
          <Input.TextArea rows={2} placeholder="Nhập địa chỉ nhà hàng" />
        </Form.Item>

        <Form.Item
          name="hotline"
          label="Hotline"
        >
          <Input placeholder="Nhập số hotline" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { type: 'email', message: 'Email không hợp lệ!' }
          ]}
        >
          <Input placeholder="Nhập email liên hệ" />
        </Form.Item>

        <Form.Item
          name="opening_hours"
          label="Giờ mở cửa"
        >
          <Input.TextArea rows={2} placeholder="Ví dụ: 08:00 - 22:00 (T2-CN)" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditRestaurantModal;