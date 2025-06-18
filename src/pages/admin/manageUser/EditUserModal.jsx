import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Upload, message } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';

const { Option } = Select;

const EditUserModal = ({ 
  visible, 
  user, 
  roles, 
  restaurants, 
  onCancel, 
  onOk, 
  form, 
  isAdmin, 
  loading 
}) => {


    const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
    const baseURL = 'http://localhost:8081/';

  useEffect(() => {
    if (visible && user) {
      form.setFieldsValue({
        full_name: user.full_name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role?.id,
        restaurant: user.restaurant?.id || undefined,
      });

      if (user.avatar) {
        setAvatarUrl(user.avatar);
      } else {
        setAvatarUrl('');
      }
      
      // Reset avatar file
      setAvatarFile(null);
    }
  }, [visible, user, form]);

  const beforeUpload = (file) => {
    // Kiểm tra loại file
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('Chỉ có thể tải lên file JPG/PNG!');
    }
    
    // Kiểm tra kích thước file
    const isLessThan2MB = file.size / 1024 / 1024 < 2;
    if (!isLessThan2MB) {
      message.error('Ảnh phải nhỏ hơn 2MB!');
    }
    
    return isJpgOrPng && isLessThan2MB;
  };

  const handleChange = info => {
    if (info.file.status === 'uploading') {
      setUploadLoading(true);
      return;
    }
    
    if (info.file.status === 'done') {
      setUploadLoading(false);
      
      // Lưu file để upload sau
      setAvatarFile(info.file.originFileObj);
      
      // Tạo URL để preview ảnh
      const reader = new FileReader();
      reader.addEventListener('load', () => setAvatarUrl(reader.result));
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  const customRequest = ({ onSuccess }) => {
    // Giả lập việc tải lên thành công ngay lập tức
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  const handleOk = () => {
    form.validateFields()
      .then(values => {
        // Nếu có file avatar mới, thêm vào form data
        if (avatarFile) {
          const formData = new FormData();
          
          // Thêm các trường dữ liệu thông thường
          Object.keys(values).forEach(key => {
            if (values[key] !== undefined && values[key] !== null) {
              formData.append(key, values[key]);
            }
          });
          
          // Thêm avatar
          formData.append('avatar', avatarFile);
          
          onOk(formData);
        } else {
          // Không có avatar mới, gửi dữ liệu thông thường
          onOk(values);
        }
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

    const uploadButton = (
    <div>
      {uploadLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Tải ảnh</div>
    </div>
  );

  return (
    <Modal
      title="Chỉnh sửa nhân viên"
      open={visible}
        onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item label="Avatar">
          <ImgCrop rotate>
            <Upload
              name="avatar"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              beforeUpload={beforeUpload}
              onChange={handleChange}
              customRequest={customRequest}
            >
              {avatarUrl ? (
                <img 
                  src={baseURL + avatarUrl} 
                  alt="avatar" 
                  style={{ width: '100%' }} 
                />
              ) : (
                uploadButton
              )}
            </Upload>
          </ImgCrop>
        </Form.Item>
        <Form.Item
          name="full_name"
          label="Họ tên"
          rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
        >
          <Input placeholder="Nhập họ tên" />
        </Form.Item>
        
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: 'Vui lòng nhập username!' }]}
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' }
          ]}
        >
          <Input placeholder="Nhập email" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Số điện thoại"
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>

        {isAdmin && (
          <>
            <Form.Item
              name="role"
              label="Vai trò"
              rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
            >
              <Select placeholder="Chọn vai trò">
                {roles.map(role => (
                  <Option key={role.id} value={role.id}>
                    {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="restaurant"
              label="Nhà hàng"
            >
              <Select allowClear placeholder="Chọn nhà hàng">
                {restaurants.map(restaurant => (
                  <Option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default EditUserModal;