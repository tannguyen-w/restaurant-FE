import  { useState, useEffect } from 'react';
import { Modal, Form, Select, DatePicker, Button, InputNumber, message,Table, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllSuppliers } from '../../../services/supplierService';
import { getAllIngredients } from '../../../services/ingredientServices';
import { createImportInvoice } from '../../../services/importInvoiceServices';
import moment from 'moment';
import { useAuth } from '../../../components/context/authContext';

const { Option } = Select;

const CreateImportInvoiceModal = ({ visible, onCancel, onSuccess }) => {
   const { user } = useAuth();
  const [form] = Form.useForm();
  const [suppliers, setSuppliers] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedIngredientIds, setSelectedIngredientIds] = useState([]);

  useEffect(() => {
    if (visible) {
      fetchSuppliers();
      fetchIngredients();
      form.resetFields();
      setItems([]);
      setSelectedIngredientIds([]);
    }
  }, [visible, form]);

  const fetchSuppliers = async () => {
    try {
      const response = await getAllSuppliers();
      console.log('suppliers response:', response);
      
      setSuppliers(response.results || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách nhà cung cấp:', error);
      message.error('Không thể tải danh sách nhà cung cấp');
    }
  };

  const fetchIngredients = async () => {
    try {
      const response = await getAllIngredients();
      setIngredients(response.results || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách nguyên liệu:', error);
      message.error('Không thể tải danh sách nguyên liệu');
    }
  };

  const handleAddItem = () => {
    setItems([...items, {
      id: Date.now(),
      ingredient: null,
      quantity: 1,
      unit_price: 0
    }]);
  };

  const handleRemoveItem = (id) => {
    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);
    
    // Update selected ingredients
    const selectedIds = newItems
      .map(item => item.ingredient)
      .filter(id => id !== null);
    
    setSelectedIngredientIds(selectedIds);
  };

  const handleIngredientChange = (value, id) => {
    const newItems = items.map(item => 
      item.id === id ? { ...item, ingredient: value } : item
    );
    setItems(newItems);
    
    // Update selected ingredients list
    const selectedIds = newItems
      .map(item => item.ingredient)
      .filter(id => id !== null);
    
    setSelectedIngredientIds(selectedIds);
  };

  const handleItemChange = (id, field, value) => {
    const newItems = items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      return total + (item.quantity * item.unit_price || 0);
    }, 0);
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      
      // Validate items
      if (items.length === 0) {
        message.error('Vui lòng thêm ít nhất một nguyên liệu');
        return;
      }
      
      // Check if all items have ingredient selected
      const hasEmptyIngredient = items.some(item => !item.ingredient);
      if (hasEmptyIngredient) {
        message.error('Vui lòng chọn nguyên liệu cho tất cả các mục');
        return;
      }

      setLoading(true);
      
      const values = form.getFieldsValue();
      
      const invoiceData = {
        supplier: values.supplier,
        import_date: values.import_date.toISOString(),
        total_amount: calculateTotal(),
        staff: user?.id || null,
        details: items.map(item => ({
          ingredient: item.ingredient,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      };
      console.log('Dữ liệu phiếu nhập:', invoiceData);
      
      
      await createImportInvoice(invoiceData);
      
      message.success('Tạo phiếu nhập thành công');
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('Lỗi khi tạo phiếu nhập:', error);
      message.error('Không thể tạo phiếu nhập: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy đơn vị của nguyên liệu
  const getIngredientUnit = (ingredientId) => {
    if (!ingredientId) return '';
    const ingredient = ingredients.find(ing => ing.id === ingredientId);
    return ingredient ? ingredient.unit : '';
  };

  const columns = [
    {
  title: 'Nguyên liệu',
  dataIndex: 'ingredient',
  key: 'ingredient',
  render: (_, record) => (
    <Select
      style={{ width: '100%' }}
      placeholder="Chọn nguyên liệu"
      value={record.ingredient}
      onChange={(value) => handleIngredientChange(value, record.id)}
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) => {
        const childrenText = option?.children?.toString().toLowerCase() || '';
        return childrenText.includes(input.toLowerCase());
      }}
      notFoundContent={ingredients.length === 0 ? "Đang tải..." : "Không tìm thấy nguyên liệu"}
    >
      {ingredients.map(ing => (
        <Option 
          key={ing.id} 
          value={ing.id}
          disabled={selectedIngredientIds.includes(ing.id) && record.ingredient !== ing.id}
        >
          {ing.name} ({ing.unit})
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
      render: (_, record) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => handleItemChange(record.id, 'quantity', value)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
      width: 100,
      render: (_, record) => (
        <div style={{ padding: '0 8px' }}>
          {getIngredientUnit(record.ingredient)}
        </div>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: 150,
      render: (_, record) => (
        <InputNumber
          min={0}
          value={record.unit_price}
          onChange={(value) => handleItemChange(record.id, 'unit_price', value)}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Thành tiền',
      key: 'amount',
      width: 150,
      render: (_, record) => {
        const amount = record.quantity * record.unit_price || 0;
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
      },
    },
    {
      title: '',
      key: 'action',
      width: 50,
      render: (_, record) => (
        <Button 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => handleRemoveItem(record.id)}
          size="small"
        />
      ),
    },
  ];

  return (
    <Modal
      title="Tạo phiếu nhập kho"
      open={visible}
      onCancel={onCancel}
      width={900}
      footer={[
        <Button key="back" onClick={onCancel}>
          Hủy
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={loading} 
          onClick={handleSubmit}
        >
          Tạo phiếu nhập
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          import_date: moment(),
        }}
      >
        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            name="supplier"
            label="Nhà cung cấp"
            rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}
            style={{ flex: 1 }}
          >
            <Select placeholder="Chọn nhà cung cấp">
              {suppliers.map(supplier => (
                <Option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="import_date"
            label="Ngày nhập"
            rules={[{ required: true, message: 'Vui lòng chọn ngày nhập' }]}
            style={{ flex: 1 }}
          >
            <DatePicker 
              format="DD/MM/YYYY" 
              style={{ width: '100%' }}
              showTime={{ format: 'HH:mm' }}
            />
          </Form.Item>
        </div>

        <Divider>Chi tiết phiếu nhập</Divider>

        <Table
          columns={columns}
          dataSource={items}
          rowKey="id"
          pagination={false}
          bordered
          summary={() => (
            <>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3} align="right">
                  <strong>Tổng cộng:</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} colSpan={2}>
                  <strong>{calculateTotal().toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </>
          )}
        />

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Button 
            type="dashed" 
            onClick={handleAddItem} 
            icon={<PlusOutlined />}
            style={{ width: '200px' }}
          >
            Thêm nguyên liệu
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateImportInvoiceModal;