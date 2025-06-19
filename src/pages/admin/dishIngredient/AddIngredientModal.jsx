import  { useState, useEffect } from 'react';
import { Modal, Form, Select, InputNumber, message } from 'antd';
import { getAllIngredients } from '../../../services/ingredientServices';
import { createDishIngredient } from '../../../services/dishIngredientService';

const { Option } = Select;

const AddIngredientModal = ({ visible, onCancel, dish, existingIngredients = [] }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  useEffect(() => {
    if (visible) {
      fetchIngredients();
      form.resetFields();
    }
  }, [visible, form]);

  const fetchIngredients = async () => {
    try {
      const response = await getAllIngredients({ limit: 500 });
      // Filter out ingredients that are already in the dish
      const availableIngredients = response.results.filter(
        ing => !existingIngredients.includes(ing.id)
      );
      setIngredients(availableIngredients);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      message.error('Không thể tải danh sách nguyên liệu');
    }
  };

  const handleIngredientSelect = (value) => {
    const selected = ingredients.find(ing => ing.id === value);
    setSelectedIngredient(selected);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await createDishIngredient({
        dish: dish.id,
        ingredient: values.ingredient,
        quantity_per_dish: values.quantity
      });

      message.success('Thêm nguyên liệu vào công thức thành công');
      onCancel(true);
    } catch (error) {
      console.error('Error adding ingredient to dish:', error);
      message.error('Không thể thêm nguyên liệu vào công thức');
    } finally {
      setLoading(false);
    }
  };

  const filterOption = (input, option) => {
    // Kiểm tra và xử lý đúng option dựa vào phiên bản Ant Design
    if (option && typeof option.label === 'string') {
      // Với Ant Design v5 và v4 (mới)
      return option.label.toLowerCase().includes(input.toLowerCase());
    } else if (option && option.children) {
      // Xử lý trường hợp children là React node
      const childrenText = 
        typeof option.children === 'string'
          ? option.children
          : String(option.children).toString(); // Convert React node to string safely
      return childrenText.toLowerCase().includes(input.toLowerCase());
    }
    return false; // Fallback nếu không tìm thấy
  };

  return (
    <Modal
      title="Thêm nguyên liệu vào công thức"
      open={visible}
      onOk={handleSubmit}
      onCancel={() => onCancel(false)}
      confirmLoading={loading}
      maskClosable={false}
      okText="Thêm"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="ingredient"
          label="Nguyên liệu"
          rules={[{ required: true, message: 'Vui lòng chọn nguyên liệu' }]}
        >
          <Select
            showSearch
            placeholder="Chọn nguyên liệu"
            optionFilterProp="children"
            onChange={handleIngredientSelect}
            filterOption={filterOption
            }
          >
            {ingredients.map(ingredient => (
              <Option key={ingredient.id} value={ingredient.id}>
                {ingredient.name} ({ingredient.category?.name || 'Chưa phân loại'})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="quantity"
          label={`Số lượng${selectedIngredient ? ` (${selectedIngredient.unit || 'đơn vị'})` : ''}`}
          rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
        >
          <InputNumber 
            style={{ width: '100%' }} 
            min={0.01} 
            step={0.01}
            precision={2}
            placeholder="Nhập số lượng cho mỗi món ăn" 
          />
        </Form.Item>

        {selectedIngredient && (
          <div style={{ marginBottom: 16 }}>
            <p>Tồn kho hiện tại: <strong>{selectedIngredient.current_stock || 0} {selectedIngredient.unit || 'đơn vị'}</strong></p>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default AddIngredientModal;