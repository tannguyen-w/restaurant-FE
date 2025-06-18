import  { useEffect, useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { createRestaurant } from '../../../services/restaurantServices';

const CreateRestaurantModal = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Reset form khi modal đóng/mở
  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      await createRestaurant(values);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Lỗi khi tạo nhà hàng:', error);
      message.error('Không thể tạo nhà hàng: ' + (error.response?.data?.message || 'Đã có lỗi xảy ra'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Thêm nhà hàng mới"
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

export default CreateRestaurantModal;