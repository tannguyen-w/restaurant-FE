import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const DeleteConfirmModal = ({ visible, supplier, onCancel, onOk }) => {
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
      okButtonProps={{ danger: true }}
    >
      {supplier && (
        <p>
          Bạn có chắc chắn muốn xóa nhà cung cấp <strong>{supplier.name}</strong>? 
          Hành động này không thể hoàn tác.
        </p>
      )}
    </Modal>
  );
};

export default DeleteConfirmModal;