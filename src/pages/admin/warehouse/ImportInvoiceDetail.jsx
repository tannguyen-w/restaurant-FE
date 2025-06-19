import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Descriptions,
  Table,
  Space,
  Divider,
  message,
  Tag,
  Spin,
  Popconfirm,
  Modal,
  Form,
  InputNumber,
  Row,
  Col,
} from "antd";
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";
import {
  getImportInvoiceById,
  deleteImportInvoice,
} from "../../../services/importInvoiceServices";

import {
  createImportInvoiceDetail,
  deleteImportInvoiceDetail,
  updateImportInvoiceDetail,
  getImportInvoiceDetailByInvoiceId,
} from "../../../services/importInvoiceDetailServices";

import { updateIngredient } from "../../../services/ingredientServices";
import { useAuth } from "../../../components/context/authContext";
import IngredientSelectModal from "./IngredientSelectModal";

const { confirm } = Modal;

const ImportInvoiceDetail = ({ invoiceId, onBack }) => {
  const [invoice, setInvoice] = useState(null);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [form] = Form.useForm();

  const { user } = useAuth();
  const isAdmin = user?.role.name === "admin";
  const isManager = user?.role.name === "manager";
  const canEditDelete = isAdmin || isManager;

  useEffect(() => {
    fetchInvoiceData();
  }, [invoiceId]);

  const fetchInvoiceData = async () => {
    setLoading(true);
    try {
      // Fetch invoice data
      const invoiceData = await getImportInvoiceById(invoiceId);
      setInvoice(invoiceData);

      // Fetch invoice details
      const detailsData = await getImportInvoiceDetailByInvoiceId(invoiceId);
      setDetails(detailsData || []);
    } catch (error) {
      console.error("Failed to fetch invoice data:", error);
      message.error("Không thể tải thông tin phiếu nhập");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = () => {
    confirm({
      title: "Xác nhận xóa phiếu nhập",
      icon: <ExclamationCircleOutlined />,
      content:
        "Bạn có chắc chắn muốn xóa phiếu nhập này? Hành động này không thể hoàn tác.",
      okType: "danger",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteImportInvoice(invoiceId);
          message.success("Xóa phiếu nhập thành công");
          if (onBack) onBack();
        } catch (error) {
          console.error("Failed to delete invoice:", error);
          message.error("Không thể xóa phiếu nhập");
        }
      },
    });
  };

  const handleDeleteItem = async (itemId) => {
    const itemToDelete = details.find((item) => item.id === itemId);
    if (!itemToDelete) return;

    try {
      // Xóa chi tiết phiếu nhập
      await deleteImportInvoiceDetail(itemId);

      // Giảm số lượng tồn kho
      await updateIngredient(itemToDelete.ingredient.id, {
        current_stock:
          itemToDelete.ingredient.current_stock - itemToDelete.quantity,
      });

      message.success("Xóa nguyên liệu thành công");
      fetchInvoiceData(); // Refresh data
    } catch (error) {
      console.error("Failed to delete item:", error);
      message.error("Không thể xóa nguyên liệu");
    }
  };

  const showEditModal = (item) => {
    setEditItem(item);
    form.setFieldsValue({
      quantity: item.quantity,
      unit_price: item.unit_price,
    });
    setModalVisible(true);
  };

  const handleUpdateItem = async () => {
    try {
      const values = await form.validateFields();
      const oldQuantity = editItem.quantity || 0;
      const newQuantity = values.quantity || 0;
      const quantityDifference = newQuantity - oldQuantity;

      // Cập nhật chi tiết phiếu nhập
      await updateImportInvoiceDetail(editItem.id, values);

      // Nếu số lượng thay đổi, cập nhật tồn kho
      if (quantityDifference !== 0) {
        await updateIngredient(editItem.ingredient.id, {
          current_stock: editItem.ingredient.current_stock + quantityDifference,
        });
      }

      message.success("Cập nhật nguyên liệu thành công");
      setModalVisible(false);
      fetchInvoiceData(); // Refresh data
    } catch (error) {
      console.error("Failed to update item:", error);
      message.error("Không thể cập nhật nguyên liệu");
    }
  };

  const handleAddIngredient = async (
    selectedIngredient,
    quantity,
    unitPrice
  ) => {
    try {
      const itemData = {
        import_invoice: invoiceId,
        ingredient: selectedIngredient.id,
        quantity: quantity,
        unit_price: unitPrice,
      };

      // Thêm chi tiết phiếu nhập
      await createImportInvoiceDetail(itemData);

      // Cập nhật số lượng tồn kho của nguyên liệu
      await updateIngredient(selectedIngredient.id, {
        current_stock: selectedIngredient.current_stock + quantity,
      });

      message.success("Thêm nguyên liệu thành công");
      setAddModalVisible(false);
      fetchInvoiceData(); // Refresh data
    } catch (error) {
      console.error("Failed to add ingredient:", error);
      message.error("Không thể thêm nguyên liệu");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    {
      title: "Nguyên liệu",
      dataIndex: ["ingredient", "name"],
      key: "ingredient",
      width: "25%",
    },
    {
      title: "Đơn vị",
      dataIndex: ["ingredient", "unit"],
      key: "unit",
      width: "10%",
      render: (text) => text || "N/A",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: "15%",
    },
    {
      title: "Đơn giá",
      dataIndex: "unit_price",
      key: "unit_price",
      width: "20%",
      render: (price) => `${price?.toLocaleString("vi-VN")} VND`,
    },
    {
      title: "Thành tiền",
      key: "amount",
      width: "20%",
      render: (_, record) => {
        const amount = (record.quantity || 0) * (record.unit_price || 0);
        return `${amount.toLocaleString("vi-VN")} VND`;
      },
    },
  ];

  // Add actions column only if user can edit/delete
  if (canEditDelete) {
    columns.push({
      title: "Thao tác",
      key: "action",
      width: "10%",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => showEditModal(record)}
          />
          <Popconfirm
            title="Bạn có chắc muốn xóa nguyên liệu này?"
            onConfirm={() => handleDeleteItem(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    });
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div>
        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
          Quay lại
        </Button>
        <div style={{ marginTop: 16, textAlign: "center" }}>
          Không tìm thấy thông tin phiếu nhập
        </div>
      </div>
    );
  }

  return (
    <div className="import-invoice-detail">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
              Quay lại
            </Button>
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              In phiếu nhập
            </Button>
            {canEditDelete && (
              <>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setAddModalVisible(true)}
                >
                  Thêm nguyên liệu
                </Button>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDeleteInvoice}
                >
                  Xóa phiếu
                </Button>
              </>
            )}
          </Space>
        </Col>
      </Row>

      <Card title="Chi tiết phiếu nhập" style={{ marginTop: 16 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Mã phiếu">
            <Tag color="blue">
              #{invoiceId.substring(invoiceId.length - 8).toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày nhập">
            {invoice && invoice.import_date
              ? moment(invoice.import_date).format("DD/MM/YYYY")
              : "N/A"}
          </Descriptions.Item>

          <Descriptions.Item label="Nhà cung cấp">
            {invoice?.supplier?.name || "Không xác định"}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {invoice?.supplier?.phone || "N/A"}
          </Descriptions.Item>

          <Descriptions.Item label="Nhân viên">
            {invoice?.staff?.full_name || "Không xác định"}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng tiền">
            <strong>
              {invoice?.total_amount?.toLocaleString("vi-VN")} VND
            </strong>
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">Danh sách nguyên liệu</Divider>

        <Table
          columns={columns}
          dataSource={details}
          rowKey="id" // Sử dụng id làm rowKey
          pagination={false}
          summary={(pageData) => {
            let totalAmount = 0;
            pageData.forEach(({ quantity, unit_price }) => {
              totalAmount += (quantity || 0) * (unit_price || 0);
            });

            return (
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={canEditDelete ? 4 : 3} index={0}>
                  <strong>Tổng cộng</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <strong>{totalAmount.toLocaleString("vi-VN")} VND</strong>
                </Table.Summary.Cell>
                {canEditDelete && <Table.Summary.Cell index={2} />}
              </Table.Summary.Row>
            );
          }}
        />
      </Card>

      {/* Edit Item Modal */}
      <Modal
        title="Chỉnh sửa nguyên liệu"
        open={modalVisible}
        onOk={handleUpdateItem}
        onCancel={() => setModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        {editItem && (
          <Form form={form} layout="vertical">
            <Form.Item label="Nguyên liệu">
              <strong>{editItem.ingredient?.name}</strong>
            </Form.Item>
            <Form.Item
              name="quantity"
              label={`Số lượng (${editItem.ingredient?.unit || "đơn vị"})`}
              rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
            >
              <InputNumber
                min={0.001}
                step={0.001}
                precision={3}
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              name="unit_price"
              label="Đơn giá (VND)"
              rules={[{ required: true, message: "Vui lòng nhập đơn giá" }]}
            >
              <InputNumber
                min={0}
                step={1000}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Add Ingredient Modal */}
      <IngredientSelectModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onAdd={handleAddIngredient}
        existingItems={details.map((item) => item.ingredient?.id)}
        invoiceId={invoiceId}
      />
    </div>
  );
};

export default ImportInvoiceDetail;
