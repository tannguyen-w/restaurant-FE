import { Modal, Button, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const ViewUserModal = ({ visible, user, onCancel }) => {
  const baseURL = 'http://localhost:8081/';
  return (
    <Modal
      title="Thông tin nhân viên"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Đóng
        </Button>,
      ]}
    >
      {user && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            {user.avatar ? (
              <Avatar 
                src= {baseURL + user.avatar}
                size={100}
                alt="Avatar" 
              />
            ) : (
              <Avatar 
                icon={<UserOutlined />} 
                size={100}
              />
            )}
          </div>
          <p><strong>Họ tên:</strong> {user.full_name || 'Chưa cập nhật'}</p>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Số điện thoại:</strong> {user.phone || 'Chưa cập nhật'}</p>
          <p><strong>Vai trò:</strong> {user.role?.name?.toUpperCase() || 'N/A'}</p>
          <p><strong>Nhà hàng:</strong> {user.restaurant?.name || 'Chưa phân công'}</p>
        </div>
      )}
    </Modal>
  );
};

export default ViewUserModal;