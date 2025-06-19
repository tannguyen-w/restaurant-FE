import  { useState, useEffect } from 'react';
import { Table, Space, Button, Input, Select,  Tag, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined} from '@ant-design/icons';
import { getAllIngredients, deleteIngredient } from '../../../services/ingredientServices';
import { getAllIngredientCategories } from '../../../services/ingredientCategoryServices';

const { Option } = Select;

const IngredientList = ({ onEdit }) => {
  const [ingredients, setIngredients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchCategories();
    fetchIngredients();
  }, [pagination.current, pagination.pageSize, searchText, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await getAllIngredientCategories();
      setCategories(response.results || []);
    } catch (error) {
      message.error('Không thể tải danh sách danh mục');
    }
  };

  const fetchIngredients = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
      };

      if (searchText) {
        params.name = searchText;
      }

      if (selectedCategory) {
        params.category = selectedCategory;
      }

      const response = await getAllIngredients(params);
      
      setIngredients(response.results || []);
      setPagination({
        ...pagination,
        total: response.totalResults || 0,
      });
    } catch (error) {
      message.error('Không thể tải danh sách nguyên liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
  };

  const handleCategoryFilter = (value) => {
    setSelectedCategory(value);
    setPagination({ ...pagination, current: 1 });
  };

  const handleDelete = async (id) => {
    try {
      await deleteIngredient(id);
      message.success('Xóa nguyên liệu thành công');
      fetchIngredients();
    } catch (error) {
      message.error('Không thể xóa nguyên liệu');
    }
  };

 

  const columns = [
    {
      title: 'Tên nguyên liệu',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (category) => category?.name || 'Chưa phân loại',
      sorter: (a, b) => (a.category?.name || '').localeCompare(b.category?.name || ''),
    },
    {
      title: 'Số lượng hiện tại',
      dataIndex: 'current_stock',
      key: 'current_stock',
      render: (stock, record) => (
        <div>
          <span style={{ marginRight: '10px' }}>{stock} {record.unit || 'đơn vị'}</span>
          <Tag color={stock > 20 ? 'green' : stock >= 10 ? 'orange' : 'red'}>
            {stock > 20 ? 'Đủ hàng' : stock >= 10 ? 'Sắp hết' : 'Cần nhập thêm'}
          </Tag>
        </div>
      ),
      sorter: (a, b) => a.current_stock - b.current_stock,
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
      render: (unit) => unit || 'Chưa thiết lập',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => onEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa nguyên liệu này không?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: '16px' }}>
        <Input.Search
          placeholder="Tìm kiếm nguyên liệu"
          onSearch={handleSearch}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
        <Select
          style={{ width: 200 }}
          placeholder="Lọc theo danh mục"
          onChange={handleCategoryFilter}
          allowClear
        >
          {categories.map((category) => (
            <Option key={category.id} value={category.id}>
              {category.name}
            </Option>
          ))}
        </Select>
        <Button onClick={() => fetchIngredients()} style={{ marginLeft: 'auto' }}>
          Làm mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={ingredients}
        rowKey="id"
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default IngredientList;