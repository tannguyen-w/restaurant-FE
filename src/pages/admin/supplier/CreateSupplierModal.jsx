import  { useEffect, useState } from 'react';
import { Modal, Form, Input,  message } from 'antd';
import { createSupplier } from '../../../services/supplierService';

const CreateSupplierModal = ({ visible, onCancel, onSuccess }) => {
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
      
      await createSupplier(values);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Lỗi khi tạo nhà cung cấp:', error);
      message.error('Không thể tạo nhà cung cấp: ' + (error.response?.data?.message || 'Đã có lỗi xảy ra'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Thêm nhà cung cấp mới"
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
          label="Tên nhà cung cấp"
          rules={[{ required: true, message: 'Vui lòng nhập tên nhà cung cấp!' }]}
        >
          <Input placeholder="Nhập tên nhà cung cấp" />
        </Form.Item>

        <Form.Item
          name="contact"
          label="Người liên hệ"
        >
          <Input placeholder="Nhập tên người liên hệ" />
        </Form.Item>

        <Form.Item
          name="address"
          label="Địa chỉ"
        >
          <Input.TextArea rows={2} placeholder="Nhập địa chỉ nhà cung cấp" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Số điện thoại"
          rules={[
            { 
              pattern: /^[0-9]{10,11}$/, 
              message: 'Số điện thoại không hợp lệ!', 
              validateTrigger: 'onChange' 
            }
          ]}
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateSupplierModal;