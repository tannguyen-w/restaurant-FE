import { Modal, Descriptions, Button } from 'antd';
import StatusTag from './StatusTag';

const ViewTableModal = ({ visible, table, onCancel }) => {
  return (
    <Modal
      title="Chi tiết bàn"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>,
      ]}
      width={600}
    >
      {table && (
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Tên bàn">{table.name}</Descriptions.Item>
          <Descriptions.Item label="Sức chứa">{table.capacity} người</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <StatusTag status={table.status} />
          </Descriptions.Item>
          <Descriptions.Item label="Nhà hàng">{table.restaurant?.name || 'N/A'}</Descriptions.Item>
         
        </Descriptions>
      )}
    </Modal>
  );
};

export default ViewTableModal;