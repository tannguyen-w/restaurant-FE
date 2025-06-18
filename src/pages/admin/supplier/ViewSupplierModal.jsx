import { Modal, Descriptions, Button } from 'antd';

const ViewSupplierModal = ({ visible, supplier, onCancel }) => {
  return (
    <Modal
      title="Chi tiết nhà cung cấp"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>,
      ]}
      width={700}
    >
      {supplier && (
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Tên nhà cung cấp">{supplier.name}</Descriptions.Item>
          <Descriptions.Item label="Người liên hệ">{supplier.contact || 'Chưa cập nhật'}</Descriptions.Item>
          <Descriptions.Item label="Địa chỉ">{supplier.address || 'Chưa cập nhật'}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{supplier.phone || 'Chưa cập nhật'}</Descriptions.Item>
          
        </Descriptions>
      )}
    </Modal>
  );
};

export default ViewSupplierModal;