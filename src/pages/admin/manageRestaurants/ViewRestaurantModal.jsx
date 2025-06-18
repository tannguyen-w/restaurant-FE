import { Modal, Descriptions, Button } from 'antd';

const ViewRestaurantModal = ({ visible, restaurant, onCancel }) => {
  return (
    <Modal
      title="Chi tiết nhà hàng"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>,
      ]}
      width={700}
    >
      {restaurant && (
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Tên nhà hàng">{restaurant.name}</Descriptions.Item>
          <Descriptions.Item label="Địa chỉ">{restaurant.address || 'Chưa cập nhật'}</Descriptions.Item>
          <Descriptions.Item label="Hotline">{restaurant.hotline || 'Chưa cập nhật'}</Descriptions.Item>
          <Descriptions.Item label="Email">{restaurant.email || 'Chưa cập nhật'}</Descriptions.Item>
          <Descriptions.Item label="Giờ mở cửa">{restaurant.opening_hours || 'Chưa cập nhật'}</Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
};

export default ViewRestaurantModal;