import { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Switch, Select, Tabs, message } from 'antd';
import { createDish, addComboItem } from '../../../services/dishService';
import { getDishCategories } from '../../../services/dishCategoryService';
import { getRestaurants } from '../../../services/restaurantServices';
import { useAuth } from '../../../components/context/authContext';
import UploadImages from './UploadImages';
import ComboItemsTable from './ComboItemsTable';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const CreateDishModal = ({ visible, onCancel, onSuccess, isAdmin }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isCombo, setIsCombo] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [comboItems, setComboItems] = useState([]);
  
  const { currentUser } = useAuth();
  const userRestaurantId = currentUser?.restaurant?.id;

  // Reset form and fetch data when modal opens
  useEffect(() => {
    if (visible) {
      form.resetFields();
      setIsCombo(false);
      setFileList([]);
      setComboItems([]);
      
      fetchCategories();
      
      if (isAdmin) {
        fetchRestaurants();
      } else if (userRestaurantId) {
        // If manager, set their restaurant as default
        form.setFieldsValue({ restaurant: userRestaurantId });
      }
    }
  }, [visible, form, isAdmin, userRestaurantId]);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await getDishCategories();
      setCategories(response.results || []);
    } catch (error) {
      console.error('Lỗi khi tải danh mục món ăn:', error);
      message.error('Không thể tải danh mục món ăn');
    }
  };

  // Fetch restaurants for admin
  const fetchRestaurants = async () => {
    try {
      const response = await getRestaurants();
      setRestaurants(response.results || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách nhà hàng:', error);
      message.error('Không thể tải danh sách nhà hàng');
    }
  };

  // Handle image list change
  const handleImagesChange = (newFileList) => {
    setFileList(newFileList);
  };

  // Handle combo items change
  const handleComboItemsChange = (items) => {
    setComboItems(items);
  };

  // Handle submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // If manager, always use their restaurant
      if (!isAdmin && userRestaurantId) {
        values.restaurant = userRestaurantId;
      }
      
      // Set isCombo flag
      values.isCombo = isCombo;
      
      // Create FormData if there are images
      const formData = new FormData();
      
      // Add regular fields
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });
      
      // Add images
      fileList.forEach(file => {
        if (file.originFileObj) {
          formData.append('images', file.originFileObj);
        }
      });
      
      // Create dish
      const createdDish = await createDish(formData);
      
      // If it's a combo, add combo items
      if (isCombo && comboItems.length > 0 && createdDish.id) {
        await Promise.all(comboItems.map(item => addComboItem({
          combo: createdDish.id,
          dish: item.dish,
          quantity: item.quantity
        })));
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Lỗi khi tạo món ăn:', error);
      message.error('Không thể tạo món ăn: ' + (error.response?.data?.message || 'Đã có lỗi xảy ra'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Thêm món ăn mới"
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="Tạo"
      cancelText="Hủy"
      width={800}
    >
      <Tabs defaultActiveKey="basic">
        <TabPane tab="Thông tin cơ bản" key="basic">
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              name="name"
              label="Tên món ăn"
              rules={[{ required: true, message: 'Vui lòng nhập tên món ăn!' }]}
            >
              <Input placeholder="Nhập tên món ăn" />
            </Form.Item>

            <Form.Item
              name="price"
              label="Giá"
              rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
            >
              <InputNumber
                min={0}
                step={1000}
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                placeholder="Giá món ăn (VNĐ)"
              />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
            >
              <TextArea rows={3} placeholder="Mô tả về món ăn" />
            </Form.Item>

            <Form.Item
              name="category"
              label="Danh mục"
            >
              <Select placeholder="Chọn danh mục" allowClear>
                {categories.map(category => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {isAdmin && (
              <Form.Item
                name="restaurant"
                label="Nhà hàng"
                rules={[{ required: true, message: 'Vui lòng chọn nhà hàng!' }]}
              >
                <Select placeholder="Chọn nhà hàng">
                  {restaurants.map(restaurant => (
                    <Option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            <Form.Item
              label="Combo"
              valuePropName="checked"
            >
              <Switch 
                checked={isCombo} 
                onChange={setIsCombo} 
                checkedChildren="Có" 
                unCheckedChildren="Không" 
              />
              <span style={{ marginLeft: 8 }}>
                {isCombo ? 'Món này là một combo' : 'Món đơn lẻ'}
              </span>
            </Form.Item>

            <Form.Item label="Hình ảnh">
              <UploadImages 
                fileList={fileList}
                onChange={handleImagesChange}
              />
            </Form.Item>
          </Form>
        </TabPane>
        {isCombo && (
          <TabPane tab="Thành phần Combo" key="combo">
            <div style={{ marginBottom: 16 }}>
              <p>Thêm các món ăn vào combo này:</p>
            </div>
            <ComboItemsTable 
              value={comboItems}
              onChange={handleComboItemsChange}
              restaurantId={form.getFieldValue('restaurant') || userRestaurantId}
            />
            <div style={{ marginTop: 16, color: '#999' }}>
              <p>Lưu ý: Chỉ các món đơn lẻ mới có thể được thêm vào combo.</p>
            </div>
          </TabPane>
        )}
      </Tabs>
    </Modal>
  );
};

export default CreateDishModal;