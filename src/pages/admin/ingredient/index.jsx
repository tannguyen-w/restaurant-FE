import  { useState } from 'react';
import { Tabs, Card, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import IngredientList from './IngredientList';
import CategoryList from './CategoryList';
import AddEditIngredientModal from './AddEditIngredientModal';
import AddEditCategoryModal from './AddEditCategoryModal';

const { TabPane } = Tabs;

const IngredientManagement = () => {
  const [activeTab, setActiveTab] = useState('ingredients');
  const [ingredientModalVisible, setIngredientModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const showAddIngredientModal = () => {
    setSelectedItem(null);
    setIsEditing(false);
    setIngredientModalVisible(true);
  };

  const showEditIngredientModal = (ingredient) => {
    setSelectedItem(ingredient);
    setIsEditing(true);
    setIngredientModalVisible(true);
  };

  const showAddCategoryModal = () => {
    setSelectedItem(null);
    setIsEditing(false);
    setCategoryModalVisible(true);
  };

  const showEditCategoryModal = (category) => {
    setSelectedItem(category);
    setIsEditing(true);
    setCategoryModalVisible(true);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handleIngredientModalClose = (refresh = false) => {
    setIngredientModalVisible(false);
    setSelectedItem(null);
  };

  const handleCategoryModalClose = (refresh = false) => {
    setCategoryModalVisible(false);
    setSelectedItem(null);
  };

  return (
    <div className="ingredient-management">
      <Card
        title="Quản lý nguyên liệu"
        extra={
          activeTab === 'ingredients' ? (
            <Button type="primary" icon={<PlusOutlined />} onClick={showAddIngredientModal}>
              Thêm nguyên liệu
            </Button>
          ) : (
            <Button type="primary" icon={<PlusOutlined />} onClick={showAddCategoryModal}>
              Thêm danh mục
            </Button>
          )
        }
      >
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="Nguyên liệu" key="ingredients">
            <IngredientList onEdit={showEditIngredientModal} />
          </TabPane>
          <TabPane tab="Danh mục nguyên liệu" key="categories">
            <CategoryList onEdit={showEditCategoryModal} />
          </TabPane>
        </Tabs>
      </Card>

      <AddEditIngredientModal
        visible={ingredientModalVisible}
        onCancel={handleIngredientModalClose}
        ingredient={selectedItem}
        isEditing={isEditing}
      />

      <AddEditCategoryModal
        visible={categoryModalVisible}
        onCancel={handleCategoryModalClose}
        category={selectedItem}
        isEditing={isEditing}
      />
    </div>
  );
};

export default IngredientManagement;