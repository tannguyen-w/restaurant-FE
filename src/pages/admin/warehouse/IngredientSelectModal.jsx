import { useState, useEffect } from 'react';
import { 
  Modal, 
  Select, 
  Form, 
  InputNumber, 
  Spin,
  message 
} from 'antd';
import { getAllIngredients } from '../../../services/ingredientServices';

const IngredientSelectModal = ({ visible, onCancel, onAdd, existingItems = [] }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      fetchIngredients();
    }
  }, [visible, form]);

  const fetchIngredients = async () => {
    setLoading(true);
    try {
      const response = await getAllIngredients();
      setIngredients(response.results || []);
    } catch (error) {
      console.error('Failed to fetch ingredients:', error);
      message.error('Không thể tải danh sách nguyên liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleIngredientChange = (value) => {
    const selected = ingredients.find(ing => ing.id === value);
    setSelectedIngredient(selected);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (!selectedIngredient) {
        message.error('Vui lòng chọn nguyên liệu');
        return;
      }
      
      onAdd(selectedIngredient, values.quantity, values.unit_price);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // Filter out already selected ingredients
  const availableIngredients = ingredients.filter(ing => 
    !existingItems.includes(ing.id)
  );

  return (
    <Modal
      title="Thêm nguyên liệu"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Thêm"
      cancelText="Hủy"
    >
      <Spin spinning={loading}>
        <Form form={form} layout="vertical">
          <Form.Item
            name="ingredient"
            label="Nguyên liệu"
            rules={[{ required: true, message: 'Vui lòng chọn nguyên liệu' }]}
          >
            <Select
              placeholder="Chọn nguyên liệu"
              onChange={handleIngredientChange}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              notFoundContent={loading ? <Spin size="small" /> : "Không tìm thấy"}
            >
              {availableIngredients.map(ingredient => (
                <Select.Option key={ingredient.id} value={ingredient.id}>
                  {ingredient.name} ({ingredient.unit || 'đơn vị'})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label={`Số lượng ${selectedIngredient ? `(${selectedIngredient.unit || 'đơn vị'})` : ''}`}
            rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
          >
            <InputNumber 
              style={{ width: '100%' }}
              min={0.001}
              step={0.001}
              precision={3}
            />
          </Form.Item>

          <Form.Item
            name="unit_price"
            label="Đơn giá (VND)"
            rules={[{ required: true, message: 'Vui lòng nhập đơn giá' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={1000}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          {selectedIngredient && (
            <div>
              <p>Tồn kho hiện tại: <strong>{selectedIngredient.stock || 0} {selectedIngredient.unit || 'đơn vị'}</strong></p>
            </div>
          )}
        </Form>
      </Spin>
    </Modal>
  );
};

export default IngredientSelectModal;