import { useState, useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { updateSupplier } from '../../../services/supplierService';

const EditSupplierModal = ({ visible, supplier, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Cập nhật form khi có dữ liệu nhà cung cấp mới
  useEffect(() => {
    if (visible && supplier) {
      form.setFieldsValue({
        name: supplier.name,
        contact: supplier.contact,
        address: supplier.address,
        phone: supplier.phone,
      });
    }
  }, [visible, supplier, form]);

  const handleSubmit = async () => {
    if (!supplier) return;
    
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      await updateSupplier(supplier.id, values);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật nhà cung cấp:', error);
      message.error('Không thể cập nhật nhà cung cấp: ' + (error.response?.data?.message || 'Đã có lỗi xảy ra'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Chỉnh sửa nhà cung cấp"
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

export default EditSupplierModal;