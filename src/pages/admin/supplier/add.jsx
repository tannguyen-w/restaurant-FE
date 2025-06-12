import React, { useEffect } from "react";
import { useNavigate,useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Button, Form, Input } from "antd";
import { addSupplier, getSupplierById, updateSupplier } from "../../../services/supplierService";

function Addsupplier() {
      const [form] = Form.useForm();
      const navigate = useNavigate();
      const { id } = useParams();
      const onFinish = async (values) => {
        try {
            if (id) {
                await updateSupplier(id, values);
                toast.success("Cập nhật nhà cung cấp thành công");
            } else {
                await addSupplier(values);
                toast.success("Thêm mới nhà cung cấp thành công");
            }
            navigate("/admin/supplier/list");
        } catch (error) {
            console.error("Error saving supplier:", error);
            toast.error("Không thể lưu thông tin nhà cung cấp");
        }
        }
        useEffect(() => {
        if (id) {
            // Fetch existing supplier data if id is provided
            const fetchSupplier = async () => {
                try {
                    const response = await getSupplierById(id);
                    form.setFieldsValue({
                        name: response.name,
                        address: response.address,
                        contact: response.contact,
                        phone: response.phone,
                    });
                } catch (error) {
                    console.error("Error fetching supplier data:", error);
                    toast.error("Không thể tải thông tin nhà cung cấp");
                }
            };
            fetchSupplier();
        } else {
            form.resetFields();
        }
    }, [id, form, navigate]);  
    return ( 
        <div className="add-supplier">
            <h1 className="text-black mt-5 mb-5">{id ? "Sửa thông tin nhà cung cấp" : "Thêm mới nhà cung cấp"}</h1>
            <p className="text-gray-500 mb-5">{!id ? "Thêm thông tin nhà cung cấp mới vào hệ thống" : "Chỉnh sửa thông tin nhà cung cấp vào hệ thống"}</p>
            <div className="add-supplier-form">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="name"
                        label="Tên nhà cung cấp"
                        rules={[{ required: true, message: "Vui lòng nhập tên nhà cung cấp!" }]}
                    >
                        <Input placeholder="Nhập tên nhà cung cấp" />
                    </Form.Item>
                    <Form.Item
                        name="address"
                        label="Địa chỉ"
                        rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
                    >
                        <Input placeholder="Nhập địa chỉ" />
                    </Form.Item>
                    <Form.Item
                        name="contact"
                        label="Email"
                        rules={[{ required: true, message: "Vui lòng nhập email!" }]}
                    >
                        <Input placeholder="Nhập email" />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        label="Số điện thoại"
                        rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
                    >
                        <Input placeholder="Nhập số điện thoại" />
                    </Form.Item>
                    <Button type="primary" htmlType="submit">
                        Thêm mới
                    </Button>
                </Form>
            </div>
        </div>
     );
}

export default Addsupplier;