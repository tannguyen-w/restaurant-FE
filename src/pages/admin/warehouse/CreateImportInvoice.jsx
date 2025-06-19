import { useState, useEffect } from 'react';
import { 
  Form, 
  Button, 
  Select, 
  DatePicker, 
  Table, 
  Space,
  Card,
  message,
  Row,
  Col,
  Divider,
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  SaveOutlined,
  ReloadOutlined 
} from '@ant-design/icons';
import moment from 'moment';
import { getAllSuppliers } from '../../../services/supplierService';
import { createImportInvoice } from '../../../services/importInvoiceServices';
import IngredientSelectModal from './IngredientSelectModal';

import { useAuth } from '../../../components/context/authContext';

const { Option } = Select;

const CreateImportInvoice = ({ onSuccess }) => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [items, setItems] = useState([]);

  const staff = user?.id || null;

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await getAllSuppliers();
      setSuppliers(response.results || []);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      message.error('Không thể tải danh sách nhà cung cấp');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (selectedIngredient, quantity, unitPrice) => {
    // Check if ingredient already exists in items
    const exists = items.some(item => item.ingredient.id === selectedIngredient.id);
    
    if (exists) {
      message.warning('Nguyên liệu này đã tồn tại trong danh sách');
      return;
    }

    const newItem = {
      key: Date.now().toString(),
      ingredient: selectedIngredient,
      quantity: quantity,
      unit_price: unitPrice,
    };

    setItems([...items, newItem]);
    setModalVisible(false);
  };

  const handleRemoveItem = (itemKey) => {
    setItems(items.filter(item => item.key !== itemKey));
  };

  const handleSubmit = async () => {
    try {
      const formValues = await form.validateFields();
      
      if (items.length === 0) {
        message.warning('Vui lòng thêm ít nhất một nguyên liệu');
        return;
      }

      setSaveLoading(true);

      // Calculate total amount
      const totalAmount = items.reduce(
        (sum, item) => sum + (item.quantity * item.unit_price), 
        0
      );

      
      // Format items for API
      const details = items.map(item => ({
        
        ingredient: item.ingredient.id,
        quantity: item.quantity,
        unit_price: item.unit_price
      }));

      console.log('item', formValues.import_date.format('YYYY-MM-DD'));

      // Create invoice data
      const invoiceData = {
        supplier: formValues.supplier,
        import_date: formValues.import_date.format('YYYY-MM-DD'),
        total_amount: totalAmount,
        staff: staff,
        details: details,
      };

      // Submit to API
      const response = await createImportInvoice(invoiceData);
      
      if (response && response.id) {
        if (onSuccess) {
          onSuccess(response);
        } else {
          message.success('Tạo phiếu nhập kho thành công');
          resetForm();
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error('Không thể tạo phiếu nhập kho');
    } finally {
      setSaveLoading(false);
    }
  };

  const resetForm = () => {
    form.resetFields();
    setItems([]);
  };

  const columns = [
    {
      title: 'Nguyên liệu',
      dataIndex: ['ingredient', 'name'],
      key: 'ingredient',
      width: '25%',
    },
    {
      title: 'Đơn vị',
      dataIndex: ['ingredient', 'unit'],
      key: 'unit',
      render: text => text || 'Đơn vị',
      width: '10%',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '15%',
      render: (text) => text,
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: '20%',
      render: price => `${price.toLocaleString('vi-VN')} VND`,
    },
    {
      title: 'Thành tiền',
      key: 'amount',
      width: '20%',
      render: (_, record) => {
        const amount = record.quantity * record.unit_price;
        return `${amount.toLocaleString('vi-VN')} VND`;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: '10%',
      render: (_, record) => (
        <Button
          icon={<DeleteOutlined />}
          danger
          onClick={() => handleRemoveItem(record.key)}
          size="small"
        />
      ),
    },
  ];

  return (
    <div className="create-import-invoice">
      <Card title="Tạo phiếu nhập kho mới">
        <Form form={form} layout="vertical" initialValues={{ import_date: moment() }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="supplier"
                label="Nhà cung cấp"
                rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}
              >
                <Select
                  placeholder="Chọn nhà cung cấp"
                  loading={loading}
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {suppliers.map(supplier => (
                    <Option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="import_date"
                label="Ngày nhập"
                rules={[{ required: true, message: 'Vui lòng chọn ngày nhập' }]}
              >
                <DatePicker 
                  format="DD/MM/YYYY"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <Divider orientation="left">Danh sách nguyên liệu</Divider>

        <div className="ingredients-section">
          <div className="ingredient-actions" style={{ marginBottom: '16px' }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setModalVisible(true)}
            >
              Thêm nguyên liệu
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={items}
            rowKey="key"
            pagination={false}
            bordered
            summary={pageData => {
              let totalAmount = 0;
              pageData.forEach(({ quantity, unit_price }) => {
                totalAmount += quantity * unit_price;
              });

              return (
                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={4} index={0}>
                    <strong>Tổng cộng</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <strong>{totalAmount.toLocaleString('vi-VN')} VND</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} />
                </Table.Summary.Row>
              );
            }}
          />
        </div>

        <Divider />

        <div className="form-actions" style={{ marginTop: '16px', textAlign: 'right' }}>
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={resetForm}
            >
              Đặt lại
            </Button>
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              onClick={handleSubmit} 
              loading={saveLoading}
              disabled={items.length === 0}
            >
              Lưu phiếu nhập
            </Button>
          </Space>
        </div>
      </Card>

      <IngredientSelectModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onAdd={handleAddItem}
        existingItems={items.map(item => item.ingredient.id)}
      />
    </div>
  );
};

export default CreateImportInvoice;