import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Space,
  message,
  Divider,
  Table,
  Upload,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import { getDishById, updateDish } from "../../../services/dishService";
import { getDishCategories } from "../../../services/dishCategoryService";
import { getRestaurants } from "../../../services/restaurantServices";
import { getDishes } from "../../../services/dishService";
import {
  getComboItems,
  createComboItem,
  updateComboItem,
  deleteComboItem,
} from "../../../services/comboService";
import { useAuth } from "../../../components/context/authContext";

const imageURL = "http://localhost:8081";

const { Option } = Select;
const { TextArea } = Input;

const EditDishModal = ({ visible, dishId, onCancel, onSuccess, isAdmin }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [isCombo, setIsCombo] = useState(false);

  const [itemsToDelete, setItemsToDelete] = useState([]);

  const [comboItems, setComboItems] = useState([]);
  const [availableDishes, setAvailableDishes] = useState([]);

  const [previewImage, setPreviewImage] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");

  const { user } = useAuth();
  const userRestaurantId = user?.restaurant?.id;

  // Hàm chuyển đổi URL tương đối thành URL đầy đủ
  const getFullImageUrl = (relativePath) => {
    if (!relativePath) return "";
    if (relativePath.startsWith("http")) return relativePath;

    // Loại bỏ dấu / ở đầu nếu có
    const path = relativePath.startsWith("/")
      ? relativePath.substring(1)
      : relativePath;
    return `${imageURL}/${path}`;
  };

  useEffect(() => {
    if (visible && dishId) {
      fetchDishData(dishId.id);
    } else {
      // Reset form when modal closes
      form.resetFields();
      setFileList([]);
      setIsCombo(false);
      setComboItems([]);
      setItemsToDelete([]);
    }
  }, [visible, dishId, form]);

  // Fetch dish data and populate form
  const fetchDishData = async (id) => {
    setDataLoading(true);
    try {
      // Load all necessary data in parallel
      const [dishData, categoriesData, restaurantsData] = await Promise.all([
        getDishById(id),
        getDishCategories(),
        isAdmin ? getRestaurants() : Promise.resolve({ results: [] }),
      ]);

      // Update form values
      form.setFieldsValue({
        name: dishData.name,
        price: dishData.price,
        description: dishData.description,
        category: dishData.category?.id,
        restaurant: dishData.restaurant?.id || userRestaurantId,
        isCombo: dishData.isCombo,
      });

      // Update state values
      setIsCombo(dishData.isCombo || false);
      setCategories(categoriesData.results || []);

      if (isAdmin) {
        setRestaurants(restaurantsData.results || []);
      }

      // Handle images
      if (dishData.images && Array.isArray(dishData.images) && dishData.images.length > 0) {
      const imageList = dishData.images.map((path, index) => {
        const fullUrl = getFullImageUrl(path);

        return {
          uid: `-${index}`,
          name: path.split("/").pop() || `image-${index}.jpg`,
          status: "done",
          url: fullUrl,
          originalPath: path, // Lưu đường dẫn gốc để khi update
        };
      });

      setFileList(imageList);
    } else {
      setFileList([]);
    }

      // If it's a combo, fetch combo details and available dishes
      if (dishData.isCombo) {
        try {
          // Load combo details
          const comboDetailsResponse = await getComboItems(id);
          setComboItems(comboDetailsResponse || []);

          // Now load available dishes (excluding dishes already in the combo)
          const usedDishIds = comboDetailsResponse.map((item) => item.dish.id);
          usedDishIds.push(id); // Also exclude the combo itself

          // Get restaurant ID for filtering available dishes
          const restaurantId = dishData.restaurant?._id || userRestaurantId;

          // Load available dishes from the same restaurant
          const allDishesResponse = await getDishes({
            restaurant: restaurantId,
            isCombo: false,
          });

          // Filter out dishes that are already in the combo
          const filteredDishes = allDishesResponse.results.filter(
            (dish) => !usedDishIds.includes(dish.id)
          );

          setAvailableDishes(filteredDishes);
        } catch (error) {
          console.error("Error loading combo details:", error);
          message.error("Không thể tải chi tiết combo");
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin món ăn:", error);
      message.error("Không thể tải thông tin món ăn");
      onCancel();
    } finally {
      setDataLoading(false);
    }
  };

  // Handle image preview
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url.substring(file.url.lastIndexOf("/") + 1)
    );
  };

  // Handle image change
  const handleImageChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // Helper function to convert file to base64
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle form submit
  const handleSubmit = async () => {
    try {
    const values = await form.validateFields();
    setLoading(true);

    // Prepare form data for multipart/form-data
    const formData = new FormData();

    // Add basic fields
    formData.append("name", values.name);
    formData.append("price", values.price);
    formData.append("description", values.description || "");
    formData.append("category", values.category);
    formData.append("isCombo", isCombo);

    // Set restaurant ID
    const restaurantId = isAdmin ? values.restaurant : userRestaurantId;
    formData.append("restaurant", restaurantId);

    // === XỬ LÝ HÌNH ẢNH ===
    
    // 1. Xử lý hình ảnh mới (các file vừa upload) - thêm từng file vào formData
    const newImages = fileList.filter(file => file.originFileObj);
    newImages.forEach(file => {
      formData.append('images', file.originFileObj);
    });

    // 2. Xử lý hình ảnh cũ cần giữ lại - lưu đường dẫn gốc
    const keepImagePaths = fileList
      .filter(file => !file.originFileObj && (file.url || file.originalPath))
      .map(file => {
        // Ưu tiên sử dụng originalPath nếu có
        if (file.originalPath) {
          return file.originalPath;
        }
        
        // Nếu không, trích xuất đường dẫn từ URL đầy đủ
        const urlParts = file.url.split('/dishes/');
        if (urlParts.length > 1) {
          return 'dishes/' + urlParts[1];
        }
        
        // Trường hợp không xác định được đường dẫn
        return file.url;
      });

    // 3. Chuyển mảng đường dẫn ảnh cũ thành JSON và thêm vào formData
    formData.append('images', JSON.stringify(keepImagePaths));

    // Save dish details
    await updateDish(dishId.id, formData);

    // Handle saving combo items if this is a combo
    if (isCombo) {
      // 1. Process items to be deleted first
      const deletePromises = itemsToDelete.map((itemId) =>
        deleteComboItem(itemId)
      );
      await Promise.all(deletePromises);

      // 2. Update existing items with changed quantities
      const updatePromises = comboItems
        .filter((item) => item.id && item.isModified)
        .map((item) => updateComboItem(item.id, item.quantity));
      await Promise.all(updatePromises);

      // 3. Add new items
      const addPromises = comboItems
        .filter((item) => !item.id) // new items don't have id
        .map((item) =>
          createComboItem({
            combo: dishId.id,
            dish: item.dish.id,
            quantity: item.quantity,
          })
        );
      await Promise.all(addPromises);
    }

    message.success("Cập nhật món ăn thành công");
    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    console.error("Error updating dish:", error);
    message.error(
      "Không thể cập nhật món ăn: " +
        (error.response?.data?.message || "Đã có lỗi xảy ra")
    );
  } finally {
    setLoading(false);
  }
  };

  // Add dish to combo
  const handleAddDishToCombo = (dish) => {
    const newItem = {
      dish: dish,
      quantity: 1,
    };
    setComboItems([...comboItems, newItem]);

    // Remove added dish from available dishes
    setAvailableDishes(availableDishes.filter((item) => item.id !== dish.id));
  };

  // Remove dish from combo
  const handleRemoveDishFromCombo = (item, index) => {
    // If it's an existing item with _id, add it to deletion list
    if (item.id) {
      setItemsToDelete([...itemsToDelete, item.id]);
    }

    // Remove from combo items list
    const updatedItems = comboItems.filter((_, i) => i !== index);
    setComboItems(updatedItems);

    // Add dish back to available dishes list if it has a dish object
    if (item.dish) {
      setAvailableDishes([...availableDishes, item.dish]);
    }
  };

  // Update dish quantity in combo
  const handleQuantityChange = (item, delta, index) => {
    const updatedItems = [...comboItems];
    const newQuantity = Math.max(1, item.quantity + delta);

    // Update the item and mark it as modified if it has an id (existing item)
    updatedItems[index] = {
      ...item,
      quantity: newQuantity,
      isModified: item.id ? true : false,
    };

    setComboItems(updatedItems);
  };

  // Handle isCombo switch change
  const handleComboSwitchChange = (checked) => {
    setIsCombo(checked);

    if (checked && !comboItems.length) {
      // If switching to combo and no combo items exist, fetch available dishes
      fetchAvailableDishes();
    }
  };

  // Fetch available dishes for combo
  const fetchAvailableDishes = async () => {
    try {
      const restaurantId = form.getFieldValue("restaurant") || userRestaurantId;
      if (!restaurantId) return;

      // Get all non-combo dishes from the restaurant
      const response = await getDishes({
        restaurant: restaurantId,
        isCombo: false,
      });

      // Filter out dishes already in the combo
      const comboItemIds = comboItems.map((item) => item.dish.id);
      const filtered = response.results.filter(
        (dish) => !comboItemIds.includes(dish.id) && dish.id !== dishId.id
      );

      setAvailableDishes(filtered);
    } catch (error) {
      console.error("Error fetching available dishes:", error);
      message.error("Không thể tải danh sách món ăn");
    }
  };

  // Available dishes table columns
  const availableDishColumns = [
    {
      title: "Tên món",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price?.toLocaleString() || 0} VND`,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => handleAddDishToCombo(record)}
        >
          Thêm
        </Button>
      ),
    },
  ];

  // Combo items table columns
  const comboItemsColumns = [
    {
      title: "Tên món",
      dataIndex: ["dish", "name"],
      key: "name",
      render: (text, record) => record.dish?.name || "Không xác định",
    },
    {
      title: "Số lượng",
      key: "quantity",
      render: (_, record, index) => (
        <Space>
          <Button
            icon={<MinusCircleOutlined />}
            size="small"
            onClick={() => handleQuantityChange(record, -1, index)}
            disabled={record.quantity <= 1}
          />
          <span>{record.quantity}</span>
          <Button
            icon={<PlusCircleOutlined />}
            size="small"
            onClick={() => handleQuantityChange(record, 1, index)}
          />
        </Space>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record, index) => (
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveDishFromCombo(record, index)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  // Custom upload button
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Tải ảnh</div>
    </div>
  );

  return (
    <Modal
      title="Chỉnh sửa món ăn"
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading || dataLoading}
      width={800}
      okText="Lưu"
      cancelText="Hủy"
    >
      {dataLoading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          Đang tải dữ liệu...
        </div>
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên món"
            rules={[{ required: true, message: "Vui lòng nhập tên món ăn!" }]}
          >
            <Input placeholder="Nhập tên món ăn" />
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá"
            rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              placeholder="Nhập giá"
            />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={4} placeholder="Mô tả món ăn" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Danh mục"
            rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
          >
            <Select placeholder="Chọn danh mục">
              {categories.map((category) => (
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
              rules={[{ required: true, message: "Vui lòng chọn nhà hàng!" }]}
            >
              <Select
                placeholder="Chọn nhà hàng"
                onChange={() => {
                  if (isCombo) fetchAvailableDishes();
                }}
              >
                {restaurants.map((restaurant) => (
                  <Option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item label="Là combo" valuePropName="checked" name="isCombo">
            <Switch checked={isCombo} onChange={handleComboSwitchChange} />
          </Form.Item>

          <Form.Item label="Hình ảnh">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              onChange={handleImageChange}
              beforeUpload={() => false} // Disable automatic upload
              multiple
            >
              {fileList.length >= 5 ? null : uploadButton}
            </Upload>
            <Modal
              open={previewOpen}
              title={previewTitle}
              footer={null}
              onCancel={() => setPreviewOpen(false)}
            >
              <img alt="Preview" style={{ width: "100%" }} src={previewImage} />
            </Modal>
            <div style={{ marginTop: 8, color: "#888" }}>
              Tối đa 5 hình, kích thước tối đa 5MB mỗi hình
            </div>
          </Form.Item>

          {/* Chi tiết combo */}
          {isCombo && (
            <>
              <Divider orientation="left">Chi tiết combo</Divider>

              <div style={{ marginBottom: 16 }}>
                <h4>Các món trong combo</h4>
                <Table
                  dataSource={comboItems}
                  columns={comboItemsColumns}
                  rowKey={(record) =>
                    record.id ||
                    `new-${Date.now()}-${record.dish?.id || Math.random()}`
                  }
                  pagination={false}
                  size="small"
                  locale={{ emptyText: "Chưa có món ăn nào trong combo" }}
                />
              </div>

              <div style={{ marginTop: 24 }}>
                <h4>Thêm món vào combo</h4>
                <Table
                  dataSource={availableDishes}
                  columns={availableDishColumns}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  size="small"
                  locale={{ emptyText: "Không có món ăn phù hợp để thêm" }}
                />
              </div>
            </>
          )}
        </Form>
      )}
    </Modal>
  );
};

export default EditDishModal;
