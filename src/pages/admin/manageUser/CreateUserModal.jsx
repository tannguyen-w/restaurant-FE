import  { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Upload, message } from 'antd';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';
import { createStaff } from '../../../services/userServices';
import { getRoles } from '../../../services/roleServices';
import { getRestaurants } from '../../../services/restaurantServices';

const { Option } = Select;

const CreateUserModal = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchData();
      form.resetFields();
      setAvatarFile(null);
      setAvatarUrl(null);
    }
  }, [visible, form]);

  const fetchData = async () => {
    try {
      const [rolesData, restaurantsData] = await Promise.all([
        getRoles(),
        getRestaurants()
      ]);
      
      // Lọc bỏ role admin khỏi danh sách
      setRoles(rolesData.results.filter(role => role.name !== 'admin'));
      setRestaurants(restaurantsData.results);
      
      // Đặt giá trị mặc định cho role là staff
      const staffRole = rolesData.results.find(role => role.name === 'staff');
      if (staffRole) {
        form.setFieldsValue({ role: staffRole.id });
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      message.error('Không thể tải dữ liệu cần thiết');
    }
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('Chỉ có thể tải lên file JPG/PNG!');
    }
    
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
    
    if (info.file.status === 'done' || info.file.originFileObj) {
      setUploadLoading(false);
      
      // Lưu file để upload sau
      setAvatarFile(info.file.originFileObj);
      
      // Tạo URL để preview ảnh
      getBase64(info.file.originFileObj, imageUrl => {
        setAvatarUrl(imageUrl);
      });
    }
  };

  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  const customRequest = ({ onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // Tạo FormData để gửi dữ liệu multipart (gồm cả file)
      const formData = new FormData();
      
      // Thêm các trường dữ liệu
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });
      
      // Thêm avatar nếu có
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      
      await createStaff(formData);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Lỗi khi tạo nhân viên:', error);
      message.error('Không thể tạo nhân viên: ' + (error.response?.data?.message || 'Đã có lỗi xảy ra'));
    } finally {
      setLoading(false);
    }
  };

  const uploadButton = (
    <div>
      {uploadLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Tải ảnh</div>
    </div>
  );

  return (
    <Modal
      title="Thêm nhân viên mới"
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="Tạo"
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item label="Avatar" className="avatar-uploader-container">
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
                  src={avatarUrl} 
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
          <Input placeholder="Nhập username" />
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
          rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu!' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
          ]}
        >
          <Input.Password placeholder="Nhập mật khẩu" />
        </Form.Item>

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
          <Select placeholder="Chọn nhà hàng" allowClear>
            {restaurants.map(restaurant => (
              <Option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateUserModal;