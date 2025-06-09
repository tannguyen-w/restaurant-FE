import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Table, Modal } from "antd";
import {
  getRestaurants,
  deleteRestaurant,
} from "../../../services/restaurantServices";
import { toast } from "react-toastify";
function ManageRestaurents() {
  const [restaurants, setRestaurants] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idRestaurant, setIdRestaurant] = useState(null);

  const navigate = useNavigate();
  const fetchRestaurants = async () => {
    try {
      const response = await getRestaurants();
      setRestaurants(response.results);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  const showModal = (id) => {
    setIdRestaurant(id);
    setIsModalOpen(true);
  };
  const handleOk = async () => {
    try {
      await deleteRestaurant(idRestaurant)
        .then((res) => {
          setIsModalOpen(false);
          fetchRestaurants();
          toast.success("Xóa nhà hàng thành công!");
        })
        .catch((error) => {
          console.error("Failed to delete restaurant:", error);
          setIsModalOpen(false);
          toast.error("Xóa nhà hàng thất bại!");
        });
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);
  console.log(restaurants);
  const columns = [
    {
      title: "Tên nhà hàng",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "hotline",
      key: "hotline",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Giờ mở cửa",
      dataIndex: "opening_hours",
      key: "opening_hours",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (index, record) => (
        <span style={{ display: "flex", gap: "10px" }}>
          <Button
            type="primary"
            onClick={() => navigate(`/admin/restaurant/${record.id}`)}
          >
            Sửa
          </Button>
          <Button type="primary" danger onClick={() => showModal(record.id)}>
            Xóa
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div>
      <h1 className="mt-5 mb-5">Danh sách nhà hàng</h1>
      <Table dataSource={restaurants} columns={columns} pagination={false} />
      <Modal
        title="Xác nhận xóa nhà hàng"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        Bạn muốn xóa nhà hàng ?
      </Modal>
    </div>
  );
}

export default ManageRestaurents;
