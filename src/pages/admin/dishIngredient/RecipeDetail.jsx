import  { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Popconfirm, 
  Typography, 
  Tooltip,
  Tag,
  Empty,
  InputNumber,
  message
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  QuestionCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { getByDish, deleteDishIngredient, updateDishIngredient } from '../../../services/dishIngredientService';
import AddIngredientModal from './AddIngredientModal';
import EditIngredientModal from './EditIngredientModal';

const { Title, Text } = Typography;

const RecipeDetail = ({ dish, onRecipeUpdate, isAdmin }) => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [editingQuantity, setEditingQuantity] = useState({});

  // Memoize fetchIngredients to prevent unnecessary re-renders
  const fetchIngredients = useCallback(async () => {
    if (!dish || !dish.id) return;
    
    setLoading(true);
    try {
      const response = await getByDish(dish.id);
      setIngredients(response || []);
    } catch (error) {
      console.error('Error fetching dish ingredients:', error);
      message.error('Không thể tải danh sách nguyên liệu cho món ăn này');
    } finally {
      setLoading(false);
    }
  }, [dish?.id, message]);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const handleAddIngredient = () => {
    setAddModalVisible(true);
  };

  const handleEditIngredient = (ingredient) => {
    setSelectedIngredient(ingredient);
    setEditModalVisible(true);
  };

  const handleDeleteIngredient = async (id) => {
    try {
      await deleteDishIngredient(id);
      message.success('Xóa nguyên liệu khỏi công thức thành công');
      fetchIngredients();
      if (onRecipeUpdate) onRecipeUpdate();
    } catch (error) {
      message.error('Không thể xóa nguyên liệu khỏi công thức');
    }
  };

  const handleAddModalClose = (refresh = false) => {
    setAddModalVisible(false);
    if (refresh) {
      fetchIngredients();
      if (onRecipeUpdate) onRecipeUpdate();
    }
  };

  const handleEditModalClose = (refresh = false) => {
    setEditModalVisible(false);
    setSelectedIngredient(null);
    if (refresh) {
      fetchIngredients();
      if (onRecipeUpdate) onRecipeUpdate();
    }
  };

  // Inline editing of quantity
  const startEditing = (record) => {
    setEditingQuantity({
      ...editingQuantity,
      [record.id]: record.quantity_per_dish
    });
  };

  const saveEditing = async (record) => {
    try {
      const newQuantity = editingQuantity[record.id];
      if (newQuantity !== record.quantity_per_dish) {
        await updateDishIngredient(record.id, {
          dish: dish.id,
          ingredient: record.ingredient.id,
          quantity_per_dish: newQuantity
        });
        message.success('Cập nhật số lượng thành công');
        fetchIngredients();
        if (onRecipeUpdate) onRecipeUpdate();
      }
      
      // Clear editing state
      const newEditing = { ...editingQuantity };
      delete newEditing[record.id];
      setEditingQuantity(newEditing);
    } catch (error) {
      message.error('Không thể cập nhật số lượng');
    }
  };

  const cancelEditing = (record) => {
    const newEditing = { ...editingQuantity };
    delete newEditing[record.id];
    setEditingQuantity(newEditing);
  };

  // Check if ingredient stock is lower than required for dish
  const checkStockStatus = (record) => {
    const currentStock = record.ingredient.current_stock || 0;
    const requiredStock = record.quantity_per_dish || 0;
    
    if (currentStock < requiredStock) {
      return 'warning';
    } else if (currentStock < requiredStock * 3) {
      return 'attention';
    }
    return 'normal';
  };

  const columns = [
    {
      title: 'Nguyên liệu',
      dataIndex: ['ingredient', 'name'],
      key: 'name',
      render: (text, record) => (
        <Space>
          {text}
          {checkStockStatus(record) === 'warning' && (
            <Tooltip title="Số lượng tồn kho không đủ!">
              <ExclamationCircleOutlined style={{ color: 'red' }} />
            </Tooltip>
          )}
          {checkStockStatus(record) === 'attention' && (
            <Tooltip title="Số lượng tồn kho thấp">
              <QuestionCircleOutlined style={{ color: 'orange' }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: ['ingredient', 'category', 'name'],
      key: 'category',
      render: (text) => text || 'Chưa phân loại',
    },
    {
      title: 'Số lượng/món',
      dataIndex: 'quantity_per_dish',
      key: 'quantity_per_dish',
      render: (text, record) => {
        // If this record is being edited
        if (editingQuantity[record.id] !== undefined) {
          return (
            <Space>
              <InputNumber
                min={0.01}
                step={0.01}
                value={editingQuantity[record.id]}
                onChange={(value) => setEditingQuantity({ ...editingQuantity, [record.id]: value })}
                style={{ width: 100 }}
              />
              <Button size="small" type="primary" onClick={() => saveEditing(record)}>Lưu</Button>
              <Button size="small" onClick={() => cancelEditing(record)}>Hủy</Button>
            </Space>
          );
        }
        
        return (
          <div onClick={() => startEditing(record)} style={{ cursor: 'pointer' }}>
            <Tag color="blue">
              {text} {record.ingredient.unit || 'đơn vị'}
            </Tag>
          </div>
        );
      },
    },
    {
      title: 'Tồn kho',
      dataIndex: ['ingredient', 'current_stock'],
      key: 'stock',
      render: (text, record) => {
        const status = checkStockStatus(record);
        return (
          <Tag color={status === 'warning' ? 'red' : status === 'attention' ? 'orange' : 'green'}>
            {text || 0} {record.ingredient.unit || 'đơn vị'}
          </Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditIngredient(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa nguyên liệu này khỏi công thức?"
            onConfirm={() => handleDeleteIngredient(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Check if any dish ingredients are low in stock
  const lowStockWarning = ingredients.some(ing => 
    (ing.ingredient.current_stock || 0) < (ing.quantity_per_dish || 0)
  );

  return (
    <Card title={<Title level={4}>Công thức món: {dish.name}</Title>}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Text>Loại: {dish.category?.name || 'Chưa phân loại'}</Text>
          {dish.isCombo && <Tag color="blue" style={{ marginLeft: 8 }}>Combo</Tag>}
          {lowStockWarning && (
            <Tag color="red" style={{ marginLeft: 8 }}>
              <ExclamationCircleOutlined /> Thiếu nguyên liệu
            </Tag>
          )}
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddIngredient}
        >
          Thêm nguyên liệu
        </Button>
      </div>

      {ingredients.length > 0 ? (
        <Table
          columns={columns}
          dataSource={ingredients}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="middle"
        />
      ) : (
        <Empty description="Chưa có nguyên liệu cho món ăn này" />
      )}

      <AddIngredientModal
        visible={addModalVisible}
        onCancel={handleAddModalClose}
        dish={dish}
        existingIngredients={ingredients.map(ing => ing.ingredient.id)}
      />

      {selectedIngredient && (
        <EditIngredientModal
          visible={editModalVisible}
          onCancel={handleEditModalClose}
          dishIngredient={selectedIngredient}
        />
      )}
    </Card>
  );
};

export default RecipeDetail;