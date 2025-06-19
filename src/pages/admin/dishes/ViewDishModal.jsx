import { useState, useEffect } from 'react';
import { Modal, Descriptions, Button, Image, Row, Col, Table, message } from 'antd';
import { getComboItems } from '../../../services/dishService';

const ViewDishModal = ({ visible, dish, onCancel }) => {
  const [comboItems, setComboItems] = useState([]);
  const [loading, setLoading] = useState(false);

    const imageURL = "http://localhost:8081";

  // Fetch combo items if this is a combo dish
  useEffect(() => {
    if (visible && dish && dish.isCombo) {
      fetchComboItems(dish.id);
    } else {
      setComboItems([]);
    }
  }, [visible, dish]);

  const fetchComboItems = async (dishId) => {
    setLoading(true);
    try {
      const response = await getComboItems(dishId);
      setComboItems(response || []);
    } catch (error) {
      console.error('Error fetching combo items:', error);
      message.error('Không thể tải danh sách món trong combo');
    } finally {
      setLoading(false);
    }
  };

  const comboColumns = [
    {
      title: 'Món ăn',
      dataIndex: ['dish', 'name'],
      key: 'name',
    },
    {
      title: 'Giá lẻ',
      dataIndex: ['dish', 'price'],
      key: 'price',
      render: (price) => price ? `${price.toLocaleString('vi-VN')} VNĐ` : 'N/A',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
  ];

  return (
    <Modal
      title="Chi tiết món ăn"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>,
      ]}
      width={800}
    >
      {dish && (
        <>
          {dish.images && dish.images.length > 0 && (
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col span={24} style={{ textAlign: 'center' }}>
                <Image.PreviewGroup>
                  {dish.images.map((image, index) => (
                    <Image
                      key={index}
                      width={120}
                      height={120}
                      style={{ objectFit: 'cover', margin: '0 8px' }}
                      src={imageURL + image}
                      alt={`${dish.name} - ${index + 1}`}
                    />
                  ))}
                </Image.PreviewGroup>
              </Col>
            </Row>
          )}
          
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Tên món">{dish.name}</Descriptions.Item>
            <Descriptions.Item label="Giá">{dish.price ? `${dish.price.toLocaleString('vi-VN')} VNĐ` : 'Không có giá'}</Descriptions.Item>
            <Descriptions.Item label="Mô tả">{dish.description || 'Không có mô tả'}</Descriptions.Item>
            <Descriptions.Item label="Loại">{dish.isCombo ? 'Combo' : 'Món đơn lẻ'}</Descriptions.Item>
            <Descriptions.Item label="Danh mục">{dish.category?.name || 'Chưa phân loại'}</Descriptions.Item>
            <Descriptions.Item label="Nhà hàng">{dish.restaurant?.name || 'N/A'}</Descriptions.Item>
            
          </Descriptions>
          
          {dish.isCombo && (
            <div style={{ marginTop: 24 }}>
              <h3>Danh sách món trong combo</h3>
              <Table
                columns={comboColumns}
                dataSource={comboItems}
                rowKey="id"
                pagination={false}
                loading={loading}
                bordered
                summary={(pageData) => {
                  if (pageData.length === 0) return null;
                  let totalPrice = 0;
                  pageData.forEach(({ dish, quantity }) => {
                    if (dish && dish.price) {
                      totalPrice += dish.price * quantity;
                    }
                  });
                  return (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={2} align="right">
                        <strong>Tổng giá lẻ:</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <strong>{totalPrice.toLocaleString('vi-VN')} VNĐ</strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  );
                }}
              />
              
              {comboItems.length > 0 && (
                <div style={{ marginTop: 16, textAlign: 'right' }}>
                  <p>
                    <strong>So với giá combo ({dish.price?.toLocaleString('vi-VN')} VNĐ):</strong>
                    {' '}
                    {(() => {
                      const totalPrice = comboItems.reduce((sum, item) => {
                        return sum + (item.dish?.price || 0) * item.quantity;
                      }, 0);
                      
                      const difference = totalPrice - (dish.price || 0);
                      const discountPercent = Math.round((difference / totalPrice) * 100);
                      
                      if (difference > 0) {
                        return (
                          <>
                            <span style={{ color: 'green' }}>
                              Tiết kiệm {difference.toLocaleString('vi-VN')} VNĐ ({discountPercent}%)
                            </span>
                          </>
                        );
                      } else if (difference < 0) {
                        return (
                          <>
                            <span style={{ color: 'red' }}>
                              Đắt hơn {Math.abs(difference).toLocaleString('vi-VN')} VNĐ ({Math.abs(discountPercent)}%)
                            </span>
                          </>
                        );
                      } else {
                        return <span>Giá không đổi</span>;
                      }
                    })()}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Modal>
  );
};

export default ViewDishModal;