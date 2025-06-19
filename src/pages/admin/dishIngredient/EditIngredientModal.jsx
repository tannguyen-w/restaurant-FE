import  { useState, useEffect } from 'react';
import { Modal, Form, InputNumber, message } from 'antd';
import { updateDishIngredient } from '../../../services/dishIngredientService';

const EditIngredientModal = ({ visible, onCancel, dishIngredient }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && dishIngredient) {
      form.setFieldsValue({
        quantity: dishIngredient.quantity_per_dish
      });
    }
  }, [visible, dishIngredient, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await updateDishIngredient(dishIngredient.id, {
        dish: dishIngredient.dish,
        ingredient: dishIngredient.ingredient.id,
        quantity_per_dish: values.quantity
      });

      message.success('Cập nhật công thức thành công');
      onCancel(true);
    } catch (error) {
      console.error('Error updating dish ingredient:', error);
      message.error('Không thể cập nhật công thức');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Chỉnh sửa: ${dishIngredient?.ingredient?.name || 'Nguyên liệu'}`}
      open={visible}
      onOk={handleSubmit}
      onCancel={() => onCancel(false)}
      confirmLoading={loading}
      maskClosable={false}
      okText="Cập nhật"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="quantity"
          label={`Số lượng (${dishIngredient?.ingredient?.unit || 'đơn vị'})`}
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

        <div style={{ marginBottom: 16 }}>
          <p>
            Tồn kho hiện tại: 
            <strong> {dishIngredient?.ingredient?.current_stock || 0} {dishIngredient?.ingredient?.unit || 'đơn vị'}</strong>
          </p>
        </div>
      </Form>
    </Modal>
  );
};

export default EditIngredientModal;