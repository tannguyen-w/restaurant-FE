import { useState, useEffect } from 'react';
import { Table, Button, InputNumber, Select, App, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getDishes } from '../../../services/dishService';

const { Option } = Select;

const ComboItemsTable = ({ value = [], onChange, restaurantId, excludeDishId = null }) => {
  const { message } = App.useApp();
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState(value);

  useEffect(() => {
    fetchDishes();
  }, [restaurantId]);

  useEffect(() => {
    setItems(value);
  }, [value]);

  const fetchDishes = async () => {
    if (!restaurantId) return;
    
    setLoading(true);
    try {
      const params = { 
        restaurant: restaurantId, 
        isCombo: false,
        limit: 100
      };
      const response = await getDishes(params);
      setDishes(response.results || []);
    } catch (error) {
      console.error('Error fetching dishes:', error);
      message.error('Không thể tải danh sách món ăn');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    // Filter out dishes that are already in the combo
    const availableDishes = dishes.filter(dish => 
      !items.some(item => item.dish === dish.id) && dish.id !== excludeDishId
    );
    
    if (availableDishes.length === 0) {
      message.warning('Không còn món ăn nào để thêm vào combo');
      return;
    }

    const newItems = [
      ...items, 
      { 
        dish: availableDishes[0].id, 
        dishInfo: availableDishes[0],
        quantity: 1, 
        key: Date.now() 
      }
    ];
    
    setItems(newItems);
    onChange(newItems);
  };

  const handleDelete = (key) => {
    const newItems = items.filter(item => item.key !== key);
    setItems(newItems);
    onChange(newItems);
  };

  const handleDishChange = (value, key) => {
    const selectedDish = dishes.find(d => d.id === value);
    const newItems = items.map(item => {
      if (item.key === key) {
        return { ...item, dish: value, dishInfo: selectedDish };
      }
      return item;
    });
    
    setItems(newItems);
    onChange(newItems);
  };

  const handleQuantityChange = (value, key) => {
    const newItems = items.map(item => {
      if (item.key === key) {
        return { ...item, quantity: value };
      }
      return item;
    });
    
    setItems(newItems);
    onChange(newItems);
  };

  const columns = [
    {
      title: 'Món ăn',
      dataIndex: 'dish',
      key: 'dish',
      render: (dish, record) => (
        <Select
          style={{ width: '100%' }}
          value={dish}
          onChange={(value) => handleDishChange(value, record.key)}
          loading={loading}
          disabled={loading}
        >
          {dishes
            .filter(d => !items.some(item => item.dish === d.id && item.key !== record.key) && d.id !== excludeDishId)
            .map(dish => (
              <Option key={dish.id} value={dish.id}>
                {dish.name} - {dish.price?.toLocaleString('vi-VN')} VNĐ
              </Option>
            ))}
        </Select>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (quantity, record) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(value) => handleQuantityChange(value, record.key)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.key)}
        />
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="dashed"
          onClick={handleAdd}
          icon={<PlusOutlined />}
          disabled={loading || !restaurantId}
        >
          Thêm món ăn vào combo
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={items}
        pagination={false}
        rowKey="key"
        bordered
        size="small"
      />
    </div>
  );
};

export default ComboItemsTable;