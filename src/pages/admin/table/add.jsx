import React, { useEffect, useState } from "react";
import { useNavigate,useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Button, Form, Input, Select } from "antd";
import { createTable, getTableById, updateTable } from "../../../services/tableService";
import { getRestaurants } from "../../../services/restaurantServices";

function AddTable() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams();
    const Option = Select.Option;
    const onFinish = async (values) => {
        try {
            if (id) {
                await updateTable(id, values.capacity);
                toast.success("Cập nhật bàn thành công");
            } else {
                await createTable(values);
                toast.success("Thêm mới bàn thành công");
            }
            navigate("/admin/table/list");
        } catch (error) {
            console.error("Error saving table:", error);
            toast.error("Không thể lưu thông tin bàn");
        }
    };
    useEffect(() => {
        if (id) {
            const fetchTable = async () => {
                try {
                    const response = await getTableById(id);
                    console.log(response);
                    
                    form.setFieldsValue({
                        name: response?.name,
                        capacity: response?.capacity,
                        restaurant: getRestaurantName(response?.restaurant),
                    });
                } catch (error) {
                    console.error("Error fetching table data:", error);
                    toast.error("Không thể tải thông tin bàn");
                }
            };
            fetchTable();
        } else {
            form.resetFields();
        }
    }, [id, form, navigate]);
    const [restaurants, setRestaurants] = useState([]);
    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await getRestaurants();
                setRestaurants(response.results || []);
            } catch (error) {
                console.error("Error fetching restaurants:", error);
                toast.error("Không thể tải danh sách nhà hàng");
            }
        };
        fetchRestaurants();
    }, []);
    const getRestaurantName = (restaurantId) => {
    const restaurant = restaurants.find((r) => r.id === restaurantId);
    return restaurant.name
  };
    return ( 
        <div>
            <h1 className="text-black mt-5 mb-5">Thêm mới bàn</h1>
            <p className="text-gray-500 mb-5">Thêm thông tin bảng mới vào hệ thống</p>
            <div className="add-table-content">
               <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="name"
                        label="Tên bàn"
                        rules={[{ required: true, message: "Vui lòng nhập tên bàn!" }]}
                    >
                        <Input placeholder="Nhập tên bàn" disabled={id ? true : false} />
                    </Form.Item>
                    <Form.Item
                        name="capacity"
                        label="Số người"
                        rules={[{ required: true, message: "Vui lòng nhập số người!" }]}
                    >
                        <Input type="number" placeholder="Nhập số người" />
                    </Form.Item>
                    <Form.Item
                        name="restaurant"
                        label="Nhà hàng"
                        rules={[{ required: true, message: "Vui lòng chọn nhà hàng!" }]}
                    >
                        <Select placeholder="Chọn nhà hàng" disabled={id ? true : false}>
                            {restaurants.map((restaurant) => (
                                <Option key={restaurant.id} value={restaurant.name}>
                                    {restaurant.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Button type="primary" htmlType="submit">
                        {id ? "Cập nhật bàn" : "Thêm mới bàn"}
                    </Button>
                </Form>
            </div>
        </div>
     );
}

export default AddTable;