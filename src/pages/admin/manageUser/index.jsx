import { useState, useEffect, useCallback } from "react";
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  message,
  Popconfirm,
  Tooltip,
  Form,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
  getStaff,
  deleteStaff,
  updateStaff,
  getUserById,
} from "../../../services/userServices";
import { getRoles } from "../../../services/roleServices";
import { getRestaurants } from "../../../services/restaurantServices";
import { useAuth } from "../../../components/context/authContext";
import ViewUserModal from "./ViewUserModal";
import EditUserModal from "./EditUserModal";
import CreateUserModal from "./CreateUserModal";

const ManagerUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);

  const [editForm] = Form.useForm();

  const { user } = useAuth();

  const isAdmin = user?.role?.name === "admin";
  const isManager = user?.role?.name === "manager";
  const userRestaurantId = user?.restaurant?.id;

  const fetchUsers = useCallback(
    async (params = {}) => {
      setLoading(true);
      try {
        // Nếu là manager, chỉ tải nhân viên thuộc nhà hàng của mình
        const queryParams = {
          page: params.page || pagination.current,
          limit: params.pageSize || pagination.pageSize,
          ...params,
        };

        if (isManager && userRestaurantId) {
          queryParams.restaurant = userRestaurantId;
        }

        const response = await getStaff(queryParams);

        setUsers(response.results);
        setPagination({
          ...pagination,
          current: response.page,
          total: response.totalResults,
        });
      } catch (error) {
        console.error("Lỗi khi tải danh sách nhân viên:", error);
        message.error("Không thể tải danh sách nhân viên");
      } finally {
        setLoading(false);
      }
    },
    [pagination.current, isManager, userRestaurantId]
  );

  const fetchDropdownData = useCallback(async () => {
    try {
      const [rolesData, restaurantsData] = await Promise.all([
        getRoles(),
        getRestaurants(),
      ]);

      setRoles(rolesData.results || []);
      setRestaurants(restaurantsData.results || []);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu dropdown:", error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchDropdownData();
  }, [fetchUsers, fetchDropdownData]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Xem chi tiết nhân viên
  const handleViewUser = async (userId) => {
    setLoadingModal(true);
    try {
      const userData = await getUserById(userId);
      setSelectedUser(userData);
      setViewModalVisible(true);
    } catch (error) {
      console.error("Lỗi khi tải thông tin nhân viên:", error);
      message.error("Không thể tải thông tin nhân viên");
    } finally {
      setLoadingModal(false);
    }
  };

  // Mở modal chỉnh sửa
  const handleEditUser = async (userId) => {
    setLoadingModal(true);
    try {
      const userData = await getUserById(userId);
      setSelectedUser(userData);
      setEditModalVisible(true);
    } catch (error) {
      console.error("Lỗi khi tải thông tin nhân viên:", error);
      message.error("Không thể tải thông tin nhân viên");
    } finally {
      setLoadingModal(false);
    }
  };

  // Lưu chỉnh sửa
  const handleUpdateUser = async (formDataOrValues) => {
    try {
      setLoadingModal(true);

      await updateStaff(selectedUser.id, formDataOrValues);
      message.success("Cập nhật thông tin nhân viên thành công");

      setEditModalVisible(false);
      fetchUsers(); // Tải lại danh sách
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin nhân viên:", error);
      message.error("Không thể cập nhật thông tin nhân viên");
    } finally {
      setLoadingModal(false);
    }
  };

  // Handle create success
  const handleCreateSuccess = () => {
    setCreateModalVisible(false);
    fetchUsers();
    message.success("Tạo nhân viên thành công");
  };

  const handleDelete = async (userId) => {
    if (!isAdmin) return;

    try {
      await deleteStaff(userId);
      message.success("Xóa nhân viên thành công");
      fetchUsers();
    } catch (error) {
      console.error("Lỗi khi xóa nhân viên:", error);
      message.error("Không thể xóa nhân viên");
    }
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Họ tên",
      dataIndex: "full_name",
      key: "full_name",
      render: (text, record) => text || record.username,
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
      dataIndex: ["role", "name"],
      key: "role",
      render: (role, record) => {
        let color;
        switch (record.role.name?.toLowerCase()) {
          case "admin":
            color = "red";
            break;
          case "manager":
            color = "green";
            break;
          default:
            color = "blue";
        }
        return (
          <Tag color={color}>{record.role.name?.toUpperCase() || "N/A"}</Tag>
        );
      },
    },
    {
      title: "Nhà hàng",
      dataIndex: ["restaurant", "name"],
      key: "restaurant",
      render: (name, record) => {
        return record.restaurant?.name || "Chưa phân công";
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewUser(record.id)}
            />
          </Tooltip>

          {isAdmin && (
            <>
              <Tooltip title="Chỉnh sửa">
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => handleEditUser(record.id)}
                />
              </Tooltip>

              {record.role.name !== "admin" && (
                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa nhân viên này?"
                  onConfirm={() => handleDelete(record.id)}
                  okText="Đồng ý"
                  cancelText="Hủy"
                >
                  <Button danger icon={<DeleteOutlined />} size="small" />
                </Popconfirm>
              )}
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title="Danh sách nhân viên"
        extra={
          isAdmin && (
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              Thêm nhân viên mới
            </Button>
          )
        }
      >
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          pagination={{
            ...pagination,
            showTotal: (total) => `Tổng cộng ${total} nhân viên`,
          }}
          loading={loading}
          onChange={handleTableChange}
          bordered
        />
      </Card>

      {/* Sử dụng các modal component đã tách */}
      <ViewUserModal
        visible={viewModalVisible}
        user={selectedUser}
        onCancel={() => setViewModalVisible(false)}
      />

      {/* Modal tạo mới - chỉ hiển thị cho admin */}
      {isAdmin && (
        <CreateUserModal
          visible={createModalVisible}
          onCancel={() => setCreateModalVisible(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Modal chỉnh sửa - chỉ hiển thị cho admin */}
      {isAdmin && (
        <EditUserModal
          visible={editModalVisible}
          user={selectedUser}
          roles={roles}
          restaurants={restaurants}
          isAdmin={isAdmin}
          form={editForm}
          loading={loadingModal}
          onOk={handleUpdateUser}
          onCancel={() => setEditModalVisible(false)}
        />
      )}
    </>
  );
};

export default ManagerUser;
