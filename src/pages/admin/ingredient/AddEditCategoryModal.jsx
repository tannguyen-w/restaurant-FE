import  { useState, useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { createIngredientCategory, updateIngredientCategory } from '../../../services/ingredientCategoryServices';

const AddEditCategoryModal = ({ visible, onCancel, category, isEditing }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (isEditing && category) {
        form.setFieldsValue({
          name: category.name,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, isEditing, category, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const categoryData = {
        name: values.name,
      };

      if (isEditing) {
        await updateIngredientCategory(category.id, categoryData);
        message.success('Cập nhật danh mục thành công');
      } else {
        await createIngredientCategory(categoryData);
        message.success('Thêm danh mục thành công');
      }

      onCancel(true);
    } catch (error) {
      console.error('Error saving category:', error);
      message.error('Không thể lưu danh mục');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEditing ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
      open={visible}
      onOk={handleSubmit}
      onCancel={() => onCancel(false)}
      confirmLoading={loading}
      maskClosable={false}
      okText={isEditing ? 'Cập nhật' : 'Thêm'}
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Tên danh mục"
          rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
        >
          <Input placeholder="Nhập tên danh mục" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddEditCategoryModal;