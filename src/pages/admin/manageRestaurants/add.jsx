import React, { useEffect } from "react";
import { Button, Form, Input } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  getRestaurantById,
  addRestaurant,
  updateRestaurant,
} from "../../../services/restaurantServices";
import { toast } from "react-toastify";

function AddRestaurants() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  useEffect(() => {
    if (id) {
      getRestaurantById(id)
        .then((response) => {
          const restaurantData = response;
          form.setFieldsValue({
            name: restaurantData.name,
            email: restaurantData.email,
            hotline: restaurantData.hotline,
            address: restaurantData.address,
            opening_hours: restaurantData.opening_hours,
          });
        })
        .catch((error) => {
          console.error("Error fetching restaurant data:", error);
        });
    } else {
      form.setFieldsValue({
        name: "",
        email: "",
        hotline: "",
        address: "",
        opening_hours: "",
      });
    }
  }, [id, form]);

  const onFinish = (values) => {
    if (id) {
      updateRestaurant(id, values)
        .then(() => {
          navigate("/admin/restaurant/list");
        toast.success("Cập nhật nhà hàng thành công!");
        })
        .catch((error) => {
          console.error("Failed to update restaurant:", error);
        });
    } else {
      addRestaurant(values)
        .then(() => {
          navigate("/admin/restaurant/list");
        toast.success("Thêm mới nhà hàng thành công!");
        })
        .catch((error) => {
          console.error("Failed to add restaurant:", error);
        });
    }
  };

  return (
    <div >
      <h1 className="mt-5 mb-5">Thêm mới nhà hàng</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label="Tên nhà hàng"
          name="name"
          rules={[
            { required: true, message: "Không được để trống tên nhà hàng!" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[{ required: true, message: "Không được để trống địa chỉ" }]}
        >
          <Input />
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
          name="hotline"
          rules={[
            { required: true, message: "Không được để trống số điện thoại!" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Giờ mở cửa"
          name="opening_hours"
          rules={[
            { required: true, message: "Không được để trống giờ mở cửa!" },
          ]}
        >
          <Input />
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

export default AddRestaurants;
