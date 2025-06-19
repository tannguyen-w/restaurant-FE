import  { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { getAllIngredientCategories } from '../../../services/ingredientCategoryServices';
import { createIngredient, updateIngredient } from '../../../services/ingredientServices';

const { Option } = Select;

const AddEditIngredientModal = ({ visible, onCancel, ingredient, isEditing }) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchCategories();
      if (isEditing && ingredient) {
        form.setFieldsValue({
          name: ingredient.name,
          current_stock: ingredient.current_stock,
          unit: ingredient.unit,
          category: ingredient.category?.id,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, isEditing, ingredient, form]);

  const fetchCategories = async () => {
    try {
      const response = await getAllIngredientCategories();
      setCategories(response.results || []);
    } catch (error) {
      message.error('Không thể tải danh sách danh mục');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const ingredientData = {
        name: values.name,
        current_stock: values.current_stock,
        unit: values.unit,
        category: values.category,
      };

      if (isEditing) {
        await updateIngredient(ingredient.id, ingredientData);
        message.success('Cập nhật nguyên liệu thành công');
      } else {
        await createIngredient(ingredientData);
        message.success('Thêm nguyên liệu thành công');
      }

      onCancel(true);
    } catch (error) {
      console.error('Error saving ingredient:', error);
      message.error('Không thể lưu nguyên liệu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEditing ? 'Chỉnh sửa nguyên liệu' : 'Thêm nguyên liệu mới'}
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
          label="Tên nguyên liệu"
          rules={[{ required: true, message: 'Vui lòng nhập tên nguyên liệu' }]}
        >
          <Input placeholder="Nhập tên nguyên liệu" />
        </Form.Item>

        <Form.Item
          name="current_stock"
          label="Số lượng"
          rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
        >
          <InputNumber style={{ width: '100%' }} min={0.01} step={0.01} precision={2} placeholder="Nhập số lượng" />
        </Form.Item>

        <Form.Item name="unit" label="Đơn vị">
          <Input placeholder="Ví dụ: kg, g, chai, hộp, ..." />
        </Form.Item>

        <Form.Item name="category" label="Danh mục">
          <Select placeholder="Chọn danh mục" allowClear>
            {categories.map((category) => (
              <Option key={category.id} value={category.id}>
                {category.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddEditIngredientModal;