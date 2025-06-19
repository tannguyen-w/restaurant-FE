import { useState } from 'react';
import { List, Input, Select, Card, Badge, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

const DishList = ({ dishes, selectedDish, onDishSelect, isAdmin }) => {
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [restaurantFilter, setRestaurantFilter] = useState('');

  // Extract unique categories and restaurants for filters
  const categories = [...new Set(dishes.map(dish => dish.category?.name).filter(Boolean))];
  const restaurants = isAdmin ? 
    [...new Set(dishes.map(dish => dish.restaurant?.name).filter(Boolean))] : 
    [];

  // Filter dishes based on search text and filters
  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = !searchText || 
      dish.name.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesCategory = !categoryFilter || 
      dish.category?.name === categoryFilter;
    
    const matchesRestaurant = !restaurantFilter || 
      dish.restaurant?.name === restaurantFilter;
    
    return matchesSearch && matchesCategory && matchesRestaurant;
  });

  const handleSearch = (value) => {
    setSearchText(value);
  };

  // Check if dish has ingredients defined
  const hasIngredients = (dish) => {
    return dish.ingredientCount && dish.ingredientCount > 0;
  };

  return (
    <Card title="Danh sách món ăn">
      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="Tìm kiếm món ăn"
          allowClear
          onSearch={handleSearch}
          style={{ width: '100%', marginBottom: 8 }}
          prefix={<SearchOutlined />}
        />
        
        <Select 
          placeholder="Lọc theo danh mục" 
          style={{ width: '100%', marginBottom: 8 }} 
          onChange={(value) => setCategoryFilter(value)}
          allowClear
        >
          {categories.map(category => (
            <Option key={category} value={category}>{category}</Option>
          ))}
        </Select>
        
        {isAdmin && (
          <Select 
            placeholder="Lọc theo nhà hàng" 
            style={{ width: '100%', marginBottom: 8 }} 
            onChange={(value) => setRestaurantFilter(value)}
            allowClear
          >
            {restaurants.map(restaurant => (
              <Option key={restaurant} value={restaurant}>{restaurant}</Option>
            ))}
          </Select>
        )}
      </div>
      
      <div style={{ 
        height: 'calc(100vh - 280px)', // Chiều cao động dựa vào viewport
        maxHeight: '600px',            // Giới hạn chiều cao tối đa
        overflowY: 'auto',             // Chỉ hiện thanh cuộn dọc khi cần
        paddingRight: '4px'            // Tạo khoảng cách với thanh cuộn
      }}>
        <List
          itemLayout="horizontal"
          dataSource={filteredDishes}
          renderItem={dish => (
            <List.Item 
              onClick={() => onDishSelect(dish)}
              style={{ 
                cursor: 'pointer', 
                background: selectedDish?.id === dish.id ? '#e6f7ff' : 'transparent',
                padding: '8px 12px',
                borderRadius: '4px',
              }}
            >
              <List.Item.Meta
                title={
                  <>
                    {dish.name}
                    {dish.isCombo && <Tag color="blue" style={{ marginLeft: 8 }}>Combo</Tag>}
                  </>
                }
                description={dish.category?.name || 'Chưa phân loại'}
              />
              <Badge 
                count={dish.ingredientCount || 0} 
                style={{ 
                  backgroundColor: hasIngredients(dish) ? '#52c41a' : '#f5222d',
                  marginLeft: 8 
                }} 
                title={hasIngredients(dish) ? 'Đã có công thức' : 'Chưa có công thức'}
              />
            </List.Item>
          )}
        />
      </div>
    </Card>
  );
};

export default DishList;