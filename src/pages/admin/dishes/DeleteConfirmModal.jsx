import  { useState, useEffect } from 'react';
import { Modal, Typography, Alert, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { getDishById } from '../../../services/dishService';

const { Text } = Typography;

const DeleteConfirmModal = ({ visible, dishId, onCancel, onOk }) => {
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && dishId) {
      setLoading(true);
      getDishById(dishId)
        .then(response => {
          setDish(response);
        })
        .catch(error => {
          console.error('Lỗi khi tải thông tin món ăn:', error);
          message.error('Không thể tải thông tin món ăn');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [visible, dishId, message]);

  return (
    <Modal
      title={
        <div>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
          Xác nhận xóa
        </div>
      }
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      okText="Xóa"
      cancelText="Hủy"
      okButtonProps={{ danger: true, loading }}
      cancelButtonProps={{ disabled: loading }}
    >
      {dish && (
        <>
          <p>
            Bạn có chắc chắn muốn xóa món <Text strong>{dish.name}</Text>?
            Hành động này không thể hoàn tác.
          </p>
          
          {dish.isCombo && (
            <Alert
              message="Món này là combo"
              description="Khi xóa combo này, tất cả thông tin liên quan đến combo cũng sẽ bị xóa."
              type="warning"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </>
      )}
    </Modal>
  );
};

export default DeleteConfirmModal;