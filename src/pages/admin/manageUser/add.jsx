import React, { useEffect } from "react";
import { Button, Select, Form, Input, Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { createStaff, getUserById, updateStaff, getRoles } from "../../../services/userServices";
import { toast } from "react-toastify";
function AddUser() {
  const { Option } = Select;
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [listRole, setListRole] = React.useState([]);

  const getListRole = () => {
    getRoles()
      .then((response) => {
        setListRole(response.results);
      })
      .catch((error) => {
        console.error("Error fetching roles:", error);
      });
  };

  console.log(listRole);

  useEffect(() => {
    if (id) {
      getUserById(id)
        .then((response) => {
          const userData = response;
          form.setFieldsValue({
            username: userData.username,
            full_name: userData.full_name,
            email: userData.email,
            password: userData.password,
            phone: userData.phone,
            role: userData.role,
            // avatar: userData.avatar ? [userData.avatar] : [],
            avatar: [
              {
                url: userData ? `http://localhost:8081/${userData.avatar}` : "",
              },
            ],
          });
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    } else {
      form.setFieldsValue({
        username: "",
        email: "",
        password: "",
        role: "staff",
        avatar: [],
      });
    }
  }, [id, form]);

  useEffect(() => {
    getListRole();
  }, []);

  const onFinish = (values) => {
    if (id) {
      form.validateFields().then((values) => {
        const userData = {
          full_name: values.full_name,
          // username: values.username,
          // password: values.password,
          role: values.role,
          email: values.email,
          avatar: values.avatar,
          phone: values.phone,
        };
        updateStaff(id, userData)
          .then((response) => {
            toast.success("Cập nhật nhân viên thành công!");
            navigate("/admin/user/list");
          })
          .catch((error) => {
            console.error("Error creating user:", error);
          });
      });
    } else {
      form.validateFields().then((values) => {
        const userData = {
          full_name: values.full_name,
          username: values.username,
          password: values.password,
          role: values.role,
          email: values.email,
          avatar: values.avatar,
          phone: values.phone,
        };
        createStaff(userData)
          .then((response) => {
            toast.success("Thêm mới nhân viên thành công!");
            navigate("/admin/user/list");
          })
          .catch((error) => {
            console.error("Error creating user:", error);
          });
      });
    }
  };
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    if (e.fileList.length > 1) {
      return [e.fileList[1]];
    }
    return e && e.fileList;
  };
  return (
    <div>
      <h1 className="text-black mt-5 mb-5">{id ? "Chỉnh sửa thông tin nhân viên" : "Thêm mới nhân viên"}</h1>
      <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
        <Form.Item
          label="Họ tên"
          name="full_name"
          rules={[{ required: true, message: "Không được để trống username!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: "Không được để trống username!" }]}
        >
          <Input disabled={id ? true : false} />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Không được để trống email!" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[{ required: true, message: "Không được để trống email!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Không được để trống password!" }]}
        >
          <Input.Password disabled={id ? true : false} />
        </Form.Item>
        <Form.Item
          name="role"
          label="Vai trò"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select placeholder="Chọn vai trò" style={{ backgroundColor: "white" }}>
            <Option value="68358036c25a7c884d0af042">Nhân viên nhà hàng</Option>
            <Option value="68358036c25a7c884d0af041">Quản lý nhà hàng</Option>
            <Option value="">Chọn vai trò</Option>
            {/* {listRole.map((role) => (
              <Option key={role.id} value={role.id}>
                {role.description}
              </Option>
            ))} */}
          </Select>
        </Form.Item>
        <Form.Item label="Avatar" name="avatar" valuePropName="fileList" getValueFromEvent={normFile}>
          <Upload
            // action="/upload.do"
            listType="picture-card"
            accept=".jpg,.png,.gif"
            maxCount={1}
            beforeUpload={() => false}
          >
            <button
              style={{
                border: 0,
                background: "none",
              }}
              type="button"
            >
              <PlusOutlined />
              <div
                style={{
                  marginTop: 8,
                }}
              >
                Upload
              </div>
            </button>
          </Upload>
        </Form.Item>
        <Form.Item label={null}>
          <Button type="primary" htmlType="submit">
            {id ? "Cập nhật" : "Thêm mới"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default AddUser;
