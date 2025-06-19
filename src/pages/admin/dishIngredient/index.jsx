import  { useState, useEffect } from 'react';
import { Card, Row, Col, Spin,  Empty, message } from 'antd';
import DishList from './DishList';
import RecipeDetail from './RecipeDetail';
import { useAuth } from '../../../components/context/authContext';
import { getDishes } from '../../../services/dishService';

const RecipeManagement = () => {
  const [dishes, setDishes] = useState([]);
  const [selectedDish, setSelectedDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const userRestaurantId = user?.restaurant?.id;
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    try {
      setLoading(true);
      
      // Setup parameters based on user role
      const params = {};
      if (!isAdmin && userRestaurantId) {
        params.restaurant = userRestaurantId;
      }

      params.limit = 200;
      
      const response = await getDishes(params);
      const nonComboDishes = (response.results || []).filter(dish => !dish.isCombo);
      
      setDishes(nonComboDishes);
      
      // Select the first dish by default if available
      if (nonComboDishes.length > 0) {
      setSelectedDish(nonComboDishes[0]);
    }
    } catch (error) {
      console.error('Error fetching dishes:', error);
      message.error('Không thể tải danh sách món ăn');
    } finally {
      setLoading(false);
    }
  };

  const handleDishSelect = (dish) => {
    setSelectedDish(dish);
  };

  const handleRecipeUpdate = () => {
    // Refresh the dish list after recipe updates
    fetchDishes();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card title="Quản lý công thức món ăn">
      <Row gutter={24}>
        <Col xs={24} sm={24} md={8} lg={8} xl={6}>
          <DishList 
            dishes={dishes} 
            selectedDish={selectedDish} 
            onDishSelect={handleDishSelect}
            isAdmin={isAdmin}
          />
        </Col>
        <Col xs={24} sm={24} md={16} lg={16} xl={18}>
          {selectedDish ? (
            <RecipeDetail 
              dish={selectedDish} 
              onRecipeUpdate={handleRecipeUpdate}
              isAdmin={isAdmin}
            />
          ) : (
            <Empty description="Chọn món ăn để xem và quản lý công thức" />
          )}
        </Col>
      </Row>
    </Card>
  );
};

export default RecipeManagement;