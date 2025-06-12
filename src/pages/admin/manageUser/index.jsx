import { useState, useEffect } from "react";
import { getStaff, deleteStaff } from "../../../services/userServices";
import { Button, Table, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
function ManageUser() {
  const [listUser, setListUser] = useState([]);
  const [idUser, setIdUser] = useState(null);
  const navigate = useNavigate();
  const fetchUsers = async () => {
    try {
      const response = await getStaff();
      console.log(response);
      setListUser(response);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = (id) => {
    setIdUser(id);
    setIsModalOpen(true);
  };
  const handleOk = async () => {
    try {
      await deleteStaff(idUser)
        .then((res) => {
          setIsModalOpen(false);
          fetchUsers();
          toast.success("Xóa nhân viên thành công!");
        })
        .catch((error) => {
          console.error("Failed to delete user:", error);
          setIsModalOpen(false);
          toast.error("Xóa nhân viên thất bại!");
        });
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  console.log(idUser);

  // const handleDelete = async (id) => {
  //   try {
  //     const response = await deleteStaff(id);
  //     fetchUsers()
  //   } catch (error) {
  //     console.error("Failed to delete user:", error);
  //   }
  // }
  const columns = [
    {
      title: "Họ và tên",
      dataIndex: "full_name",
      key: "name",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => <>{role?.description}</>,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (index, record) => (
        <span style={{ display: "flex", gap: "10px" }}>
          <Button type="primary" onClick={() => navigate(`/admin/users/${record.id}`)}>
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
    <div className="list-user">
      <h1 className="mb-5 mt-5">Danh sách người dùng</h1>
      <Table dataSource={listUser} columns={columns} pagination={false} />
      <Modal
        title="Xác nhận xóa nhân viên"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        Bạn muốn xóa nhân viên này?
      </Modal>
    </div>
  );
}

export default ManageUser;
