import { useEffect, useMemo, useState } from "react";
import Search from "../../../components/admin/search";

import { Table, Tag, Spin, Button, Modal, message, InputNumber, Select, Input } from "antd";
import { useAuth } from "../../../components/context/authContext";
import { getOrdersByRestaurant, updateOrderStatus, updateOrder } from "../../../services/orderService";
import {
  getOrderDetailById,
  createOrderDetail,
  updateOrderDetail,
  deleteOrderDetail,
} from "../../../services/orderDetailService";
import { getDishesByRestaurant } from "../../../services/dishService";
import { getTablesByRestaurant } from "../../../services/tableService";

import { createInvoice, getCheckOrderInvoice } from "../../../services/invoiceService";

const OrderList = () => {
  const { user } = useAuth();
  const restaurantId = user.restaurant.id;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [editingOrder, setEditingOrder] = useState(null);
  const [editingItems, setEditingItems] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [dishes, setDishes] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [tables, setTables] = useState([]);
  const [originalItems, setOriginalItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [payingOrder, setPayingOrder] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paidOrders, setPaidOrders] = useState([]);

  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const pageSize = 10;

  // Hàm xử lý kết quả tìm kiếm từ component Search
  const handleSearchResults = (searchedOrders, count) => {
    setOrders(searchedOrders);
    setTotalResults(count);
  };

  const statusTransitions = {
    pending: ["preparing", "cancelled"], // pending -> preparing
    preparing: ["served", "cancelled"], // preparing -> served
    served: ["finished", "cancelled"], // served -> finished

    // Trạng thái cuối
    finished: [],
    cancelled: [],
  };

  const getTransitions = (status) => {
    return statusTransitions[status] || [];
  };

  const statusColors = {
    pending: "gold",
    preparing: "blue",
    served: "cyan",
    finished: "green",
    cancelled: "red",
  };

  const memoizedParams = useMemo(
    () => ({
      orderType: filter !== "all" ? filter : undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
    }),
    [filter, statusFilter]
  );

  // Lấy danh sách bàn khi mở modal và cho phép chỉnh sửa
  useEffect(() => {
    if (editingOrder && (editingOrder.status === "pending" || editingOrder.status === "preparing")) {
      getTablesByRestaurant(restaurantId).then((res) => setTables(res.results || []));
    }
  }, [editingOrder, restaurantId]);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params = { page: currentPage, limit: pageSize };

        // Thêm orderType vào params nếu filter không phải "all"
        if (filter !== "all") {
          params.orderType = filter;
        }

        // Thêm status vào params nếu statusFilter không phải "all"
        if (statusFilter !== "all") {
          params.status = statusFilter;
        }

        const res = await getOrdersByRestaurant(restaurantId, params);
        setOrders(res.results || []);

        // Cập nhật totalResults từ kết quả API
        setTotalResults(res.totalResults || 0);

        // Kiểm tra trạng thái thanh toán của các đơn hàng
        const paidOrdersIds = [];
        for (const order of res.results || []) {
          const invoiceCheck = await getCheckOrderInvoice(order.id);
          if (invoiceCheck && invoiceCheck.exists) {
            paidOrdersIds.push(order.id);
          }
        }
        setPaidOrders(paidOrdersIds);
      } catch {
        setOrders([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [restaurantId, currentPage, pageSize, filter, statusFilter]);

  // Lấy danh sách món ăn khi mở modal
  useEffect(() => {
    if (editingOrder && (editingOrder.status === "pending" || editingOrder.status === "preparing")) {
      getDishesByRestaurant(restaurantId).then((res) => setDishes(res.results || []));
    }
  }, [editingOrder, restaurantId]);

  // const filteredOrders = filter === "all" ? orders : orders.filter((order) => order.orderType === filter);

  const handleEditOrder = async (order) => {
    setModalLoading(true);
    setEditingOrder(order);
    try {
      const detail = await getOrderDetailById(order.id);
      setEditingItems(detail.data || []);
      setOriginalItems(detail.data ? JSON.parse(JSON.stringify(detail.data)) : []);
      setTotalAmount((detail.data || []).reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0));

      // Kiểm tra trạng thái thanh toán
      const invoiceCheck = await getCheckOrderInvoice(order.id);
      if (invoiceCheck && invoiceCheck.exists && !paidOrders.includes(order.id)) {
        setPaidOrders([...paidOrders, order.id]);
      }
    } catch {
      setEditingItems([]);
      setOriginalItems([]);
      setTotalAmount(0);
    } finally {
      setModalLoading(false);
    }
  };

  // Thêm món (giả sử có danh sách món ăn, ở đây chỉ demo)
  const handleAddDish = () => {
    setEditingItems([...editingItems, { dish: null, quantity: 1, price: 0 }]);
  };

  // Xóa món
  const handleRemoveDish = (idx) => {
    setEditingItems(editingItems.filter((_, i) => i !== idx));
  };

  // Cập nhật thông tin món
  const handleChangeDish = (idx, field, value) => {
    const newItems = [...editingItems];
    if (field === "dish") {
      const dishObj = dishes.find((d) => d.id === value);
      newItems[idx].dish = dishObj;
      newItems[idx].price = dishObj?.price || 0;
    } else {
      newItems[idx][field] = value;
    }
    setEditingItems(newItems);
  };

  // Lưu chỉnh sửa
  // Nút cập nhật order: so sánh originalItems và editingItems để xác định thêm/sửa/xóa
  const handleSaveEdit = async () => {
    setModalLoading(true);
    try {
      // 0. Cập nhật thông tin order (fullName, phone, address, note, table)
      await updateOrder(editingOrder.id, {
        fullName: editingOrder.fullName,
        phone: editingOrder.phone,
        address: editingOrder.address,
        note: editingOrder.note,
        table: editingOrder.table?._id || editingOrder.table?.id || editingOrder.table,
      });
      // 1. Xác định món bị xóa (có id trong originalItems nhưng không còn trong editingItems)
      const removed = originalItems.filter((ori) => ori.id && !editingItems.some((item) => item.id === ori.id));
      // 2. Xác định món mới (không có id)
      const added = editingItems.filter((item) => !item.id && item.dish && item.dish.id);
      // 3. Xác định món sửa (có id, và quantity hoặc price thay đổi)
      const updated = editingItems.filter((item) => {
        if (!item.id) return false;
        const ori = originalItems.find((o) => o.id === item.id);
        return ori && (ori.quantity !== item.quantity || ori.price !== item.price || ori.dish.id !== item.dish.id);
      });

      // 4. Gọi API xóa
      for (const item of removed) {
        await deleteOrderDetail(item.id);
      }
      // 5. Gọi API thêm
      for (const item of added) {
        await createOrderDetail({
          order: editingOrder.id,
          dish: item.dish.id,
          quantity: item.quantity,
          price: item.price,
        });
      }
      // 6. Gọi API sửa
      for (const item of updated) {
        await updateOrderDetail(item.id, {
          dish: item.dish.id,
          quantity: item.quantity,
          price: item.price,
        });
      }

      message.success("Cập nhật đơn hàng thành công!");
      setEditingOrder(null);
      // Reload orders với các filter và search hiện tại
      const params = { page: currentPage, limit: pageSize };
      if (filter !== "all") params.orderType = filter;
      if (statusFilter !== "all") params.status = statusFilter;

      const res = await getOrdersByRestaurant(restaurantId, params);
      setOrders(res.results || []);
      setTotalResults(res.totalResults || 0);
    } catch {
      message.error("Cập nhật thất bại!");
    } finally {
      setModalLoading(false);
    }
  };

  const handleChangeStatus = async (order, newStatus) => {
    setLoading(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      message.success("Cập nhật trạng thái thành công!");
      // Reload orders với các filter và search hiện tại
      const params = { page: currentPage, limit: pageSize };
      if (filter !== "all") params.orderType = filter;
      if (statusFilter !== "all") params.status = statusFilter;

      const res = await getOrdersByRestaurant(restaurantId, params);
      setOrders(res.results || []);
      setTotalResults(res.totalResults || 0);
    } catch {
      message.error("Cập nhật trạng thái thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // Hàm mở modal thanh toán
  const handleOpenPayment = (order) => {
    setPayingOrder(order);
    setPaymentModalVisible(true);

    // Lấy thông tin chi tiết đơn hàng (tương tự như handleEditOrder)
    const fetchOrderDetails = async () => {
      setPaymentLoading(true);
      try {
        const detail = await getOrderDetailById(order.id);
        setEditingItems(detail.data || []);
        setTotalAmount((detail.data || []).reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0));
      } catch {
        setEditingItems([]);
        setTotalAmount(0);
      } finally {
        setPaymentLoading(false);
      }
    };

    fetchOrderDetails();
  };

  // Hàm xử lý xác nhận thanh toán
  const handleConfirmPayment = async () => {
    if (!payingOrder) return;

    setPaymentLoading(true);
    try {
      // Tính toán final_amount sau khi trừ discount
      const finalAmount = Math.max(0, totalAmount - discount);

      // 1. Tạo invoice (hóa đơn) trước
      await createInvoice({
        order: payingOrder.id,
        total_amount: totalAmount,
        discount: discount,
        final_amount: finalAmount,
        payment_method: paymentMethod,
      });

      // Đối với đơn dine-in, chuyển sang trạng thái "finished"
      if (payingOrder.orderType === "dine-in") {
        await updateOrderStatus(payingOrder.id, "finished");
      }

      message.success("Thanh toán thành công!");
      setPaymentModalVisible(false);
      setPayingOrder(null);

      // Reset các giá trị
      setDiscount(0);
      setPaymentMethod("cash");

      // Reload danh sách đơn hàng với các filter hiện tại
      const params = { page: currentPage, limit: pageSize };
      if (filter !== "all") params.orderType = filter;
      if (statusFilter !== "all") params.status = statusFilter;

      const res = await getOrdersByRestaurant(restaurantId, params);
      setOrders(res.results || []);
      setTotalResults(res.totalResults || 0);

      // Cập nhật danh sách đơn đã thanh toán
      setPaidOrders([...paidOrders, payingOrder.id]);
    } catch (error) {
      console.error("Thanh toán thất bại:", error);
      message.error("Thanh toán thất bại!");
    } finally {
      setPaymentLoading(false);
    }
  };

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "id",
      key: "id",
      render: (id, record) => (
        <Button type="link" className="staff-order__id" onClick={() => handleEditOrder(record)}>
          {id}
        </Button>
      ),
    },
    { title: "Khách hàng", dataIndex: "fullName", key: "fullName" },
    { title: "SĐT", dataIndex: "phone", key: "phone" },
    {
      title: "Ngày đặt",
      dataIndex: "orderTime",
      key: "orderTime",
      render: (value) => {
        const d = new Date(value);
        const pad = (n) => n.toString().padStart(2, "0");
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(
          d.getMinutes()
        )}`;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        // Trạng thái không thể quay lại các trạng thái trước
        const nextStatuses = getTransitions(status, record.orderType);
        if (nextStatuses.length === 0) {
          return <Tag color={statusColors[status] || "default"}>{status}</Tag>;
        }
        return (
          <Select value={status} style={{ minWidth: 120 }} onChange={(value) => handleChangeStatus(record, value)}>
            <Select.Option value={status}>
              <Tag color={statusColors[status] || "default"} style={{ marginRight: 0 }}>
                {status}
              </Tag>
            </Select.Option>
            {nextStatuses.map((s) => (
              <Select.Option key={s} value={s}>
                <Tag color={statusColors[s] || "default"} style={{ marginRight: 0 }}>
                  {s}
                </Tag>
              </Select.Option>
            ))}
          </Select>
        );
      },
    },
    {
      title: "Thanh toán",
      key: "payment",
      render: (_, record) => {
        // Kiểm tra xem đơn hàng đã có hóa đơn hay chưa
        const isPaid = paidOrders.includes(record.id);

        // Nếu đã có hóa đơn, hiển thị đã thanh toán
        if (isPaid) {
          return <Tag color="green">Đã thanh toán</Tag>;
        }

        // Nếu là đơn online và đang ở trạng thái pending
        if (record.orderType === "online" && record.status === "pending") {
          return (
            <Button type="primary" onClick={() => handleOpenPayment(record)}>
              Xác nhận thanh toán
            </Button>
          );
        }

        // Nếu là đơn dine-in và đang ở trạng thái served
        if (record.orderType === "dine-in" && record.status === "served") {
          return (
            <Button type="primary" onClick={() => handleOpenPayment(record)}>
              Thanh toán
            </Button>
          );
        }

        // Các trường hợp khác
        return <Tag color="orange">Chưa thanh toán</Tag>;
      },
    },
  ];

  // Modal content
  const renderModalContent = () => {
    if (modalLoading) return <Spin />;
    if (!editingOrder) return null;

    const editable = editingOrder.status === "pending" || editingOrder.status === "preparing";

    return (
      <div>
        {/* Thông tin chung của đơn hàng */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div>
              <b>Khách hàng:</b>
              {editable ? (
                <Input
                  value={editingOrder.fullName}
                  style={{ width: 180 }}
                  onChange={(e) => setEditingOrder({ ...editingOrder, fullName: e.target.value })}
                />
              ) : (
                <span style={{ marginLeft: 8 }}>{editingOrder.fullName}</span>
              )}
            </div>
            <div>
              <b>SĐT:</b>
              {editable ? (
                <Input
                  value={editingOrder.phone}
                  style={{ width: 140 }}
                  onChange={(e) => setEditingOrder({ ...editingOrder, phone: e.target.value })}
                />
              ) : (
                <span style={{ marginLeft: 8 }}>{editingOrder.phone}</span>
              )}
            </div>
            <div>
              <b>Bàn:</b>
              {editable ? (
                <Select
                  showSearch
                  style={{ width: 140, marginLeft: 8 }}
                  placeholder="Chọn bàn"
                  value={editingOrder.table?._id || editingOrder.table?.id || editingOrder.table}
                  onChange={(value) => {
                    const tableObj = tables.find((t) => t.id === value || t._id === value);
                    setEditingOrder({ ...editingOrder, table: tableObj });
                  }}
                  filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                >
                  {tables.map((table) => (
                    <Select.Option key={table.id || table._id} value={table.id || table._id}>
                      {table.name}
                    </Select.Option>
                  ))}
                </Select>
              ) : (
                <span style={{ marginLeft: 8 }}>{editingOrder.table?.name || editingOrder.table || "N/A"}</span>
              )}
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <b>Địa chỉ:</b>
            {editable ? (
              <Input
                value={editingOrder.address}
                style={{ width: 350, marginLeft: 8 }}
                onChange={(e) => setEditingOrder({ ...editingOrder, address: e.target.value })}
              />
            ) : (
              <span style={{ marginLeft: 8 }}>{editingOrder.address}</span>
            )}
          </div>
          <div style={{ marginTop: 8 }}>
            <b>Ghi chú:</b>
            {editable ? (
              <Input
                value={editingOrder.note}
                style={{ width: 350, marginLeft: 8 }}
                onChange={(e) => setEditingOrder({ ...editingOrder, note: e.target.value })}
              />
            ) : (
              <span style={{ marginLeft: 8 }}>{editingOrder.note}</span>
            )}
          </div>
        </div>

        {/* Danh sách món ăn */}
        {editable && (
          <Button onClick={handleAddDish} type="dashed" style={{ marginBottom: 12 }}>
            Thêm món
          </Button>
        )}
        {editingItems.map((item, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            {editable ? (
              <>
                <Select
                  showSearch
                  style={{ width: 200, marginRight: 8 }}
                  placeholder="Chọn món"
                  value={item.dish?.id}
                  onChange={(value) => handleChangeDish(idx, "dish", value)}
                  filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                >
                  {dishes.map((dish) => (
                    <Select.Option key={dish.id} value={dish.id}>
                      {dish.name}
                    </Select.Option>
                  ))}
                </Select>
                <InputNumber
                  min={1}
                  style={{ width: 80, marginRight: 8 }}
                  value={item.quantity}
                  onChange={(value) => handleChangeDish(idx, "quantity", value)}
                />
                <InputNumber
                  min={0}
                  style={{ width: 100, marginRight: 8 }}
                  value={item.price}
                  onChange={(value) => handleChangeDish(idx, "price", value)}
                />
                <Button danger onClick={() => handleRemoveDish(idx)}>
                  Xóa
                </Button>
              </>
            ) : (
              <>
                <span style={{ width: 200, marginRight: 8 }}>{item.dish?.name}</span>
                <span style={{ width: 80, marginRight: 8 }}>{item.quantity}</span>
                <span style={{ width: 100, marginRight: 8 }}>{item.price?.toLocaleString()} đ</span>
              </>
            )}
          </div>
        ))}

        <div style={{ fontWeight: 600, marginBottom: 12 }}>
          Tổng tiền: <span style={{ color: "#ff4d4f" }}>{totalAmount.toLocaleString()} đ</span>
        </div>
      </div>
    );
  };

  // Render nội dung modal thanh toán
  const renderPaymentContent = () => {
    if (paymentLoading) return <Spin />;
    if (!payingOrder) return null;

    // Tính toán final_amount sau khi trừ discount
    const finalAmount = Math.max(0, totalAmount - discount);

    return (
      <div>
        {/* Thông tin chung của đơn hàng */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div>
              <b>Khách hàng:</b>
              <span style={{ marginLeft: 8 }}>{payingOrder.fullName}</span>
            </div>
            <div>
              <b>SĐT:</b>
              <span style={{ marginLeft: 8 }}>{payingOrder.phone}</span>
            </div>
            <div>
              <b>Bàn:</b>
              <span style={{ marginLeft: 8 }}>{payingOrder.table?.name || payingOrder.table || "N/A"}</span>
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <b>Địa chỉ:</b>
            <span style={{ marginLeft: 8 }}>{payingOrder.address}</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <b>Ghi chú:</b>
            <span style={{ marginLeft: 8 }}>{payingOrder.note}</span>
          </div>
        </div>

        {/* Danh sách món ăn */}
        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <h3>Chi tiết đơn hàng</h3>
          <div
            style={{
              display: "flex",
              fontWeight: "bold",
              borderBottom: "1px solid #f0f0f0",
              paddingBottom: 8,
              marginBottom: 8,
            }}
          >
            <span style={{ width: 300 }}>Món</span>
            <span style={{ width: 80, textAlign: "center" }}>SL</span>
            <span style={{ width: 120, textAlign: "right" }}>Đơn giá</span>
            <span style={{ width: 120, textAlign: "right" }}>Thành tiền</span>
          </div>

          {editingItems.map((item, idx) => (
            <div key={idx} style={{ display: "flex", marginBottom: 8 }}>
              <span style={{ width: 300 }}>{item.dish?.name}</span>
              <span style={{ width: 80, textAlign: "center" }}>{item.quantity}</span>
              <span style={{ width: 120, textAlign: "right" }}>{item.price?.toLocaleString()} đ</span>
              <span style={{ width: 120, textAlign: "right" }}>
                {((item.price || 0) * (item.quantity || 0)).toLocaleString()} đ
              </span>
            </div>
          ))}
        </div>

        {/*   Thông tin thanh toán */}
        <div style={{ marginTop: 24, borderTop: "1px solid #f0f0f0", paddingTop: 16 }}>
          <h3>Thông tin thanh toán</h3>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
              <span style={{ width: 200 }}>Tổng tiền hàng:</span>
              <span style={{ fontWeight: 600 }}>{totalAmount.toLocaleString()} đ</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
              <span style={{ width: 200 }}>Giảm giá:</span>
              <InputNumber
                min={0}
                max={totalAmount}
                style={{ width: 150 }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                value={discount}
                onChange={(value) => setDiscount(value || 0)}
                addonAfter="đ"
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
              <span style={{ width: 200 }}>Phương thức thanh toán:</span>
              <Select style={{ width: 150 }} value={paymentMethod} onChange={(value) => setPaymentMethod(value)}>
                <Select.Option value="cash">Tiền mặt</Select.Option>
                <Select.Option value="card">Thẻ</Select.Option>
                <Select.Option value="e-wallet">Ví điện tử</Select.Option>
              </Select>
            </div>
          </div>

          {/* Tổng tiền */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              borderTop: "1px solid #f0f0f0",
              paddingTop: 16,
              marginTop: 8,
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 16 }}>
              Tổng thanh toán:
              <span style={{ color: "#ff4d4f", fontSize: 20, marginLeft: 8 }}>{finalAmount.toLocaleString()} đ</span>
              {discount > 0 && (
                <div style={{ fontSize: 14, color: "green" }}>(Đã giảm: {discount.toLocaleString()} đ)</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h1 className="staff-content__header">Danh sách đơn hàng</h1>
      <div className="staff-order-filter">
        <div className="staff-order-filter__orderType">
          <Button
            type={filter === "all" ? "primary" : "default"}
            onClick={() => setFilter("all")}
            style={{ marginRight: 8 }}
          >
            Tất cả
          </Button>
          <Button
            type={filter === "online" ? "primary" : "default"}
            onClick={() => {
              setFilter("online"), setCurrentPage(1);
            }}
            style={{ marginRight: 8 }}
          >
            Online
          </Button>
          <Button
            type={filter === "dine-in" ? "primary" : "default"}
            onClick={() => {
              setFilter("dine-in"), setCurrentPage(1);
            }}
          >
            Dine-in
          </Button>
        </div>
        <Search
          placeholder="Tìm kiếm đơn hàng theo tên, SĐT..."
          fetchData={getOrdersByRestaurant}
          onSearchResults={handleSearchResults}
          currentPage={currentPage}
          pageSize={pageSize}
          additionalParams={memoizedParams}
        />
        <div className="staff-order-filter__status">
          <Select
            style={{ width: 120 }}
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1); // Reset về trang 1 khi đổi filter
            }}
          >
            <Select.Option value="all">Tất cả</Select.Option>
            <Select.Option value="pending">
              <Tag color={statusColors.pending}>pending</Tag>
            </Select.Option>
            <Select.Option value="preparing">
              <Tag color={statusColors.preparing}>preparing</Tag>
            </Select.Option>
            <Select.Option value="served">
              <Tag color={statusColors.served}>served</Tag>
            </Select.Option>
            <Select.Option value="finished">
              <Tag color={statusColors.finished}>finished</Tag>
            </Select.Option>
            <Select.Option value="cancelled">
              <Tag color={statusColors.cancelled}>cancelled</Tag>
            </Select.Option>
          </Select>
        </div>
      </div>
      {loading ? (
        <Spin />
      ) : (
        <>
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalResults,
              showSizeChanger: false,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn hàng`,
              onChange: (page) => {
                setCurrentPage(page);
              },
            }}
          />
        </>
      )}

      {/* Modal chỉnh sửa đơn hàng */}
      <Modal
        open={!!editingOrder}
        title={`Chi tiết đơn hàng ${editingOrder?.id}`}
        onCancel={() => setEditingOrder(null)}
        onOk={
          editingOrder && (editingOrder.status === "pending" || editingOrder.status === "preparing")
            ? handleSaveEdit
            : undefined
        }
        confirmLoading={modalLoading}
        okText="Cập nhật"
        cancelText="Đóng"
        width={700}
        okButtonProps={{
          disabled: !(editingOrder && (editingOrder.status === "pending" || editingOrder.status === "preparing")),
        }}
      >
        {renderModalContent()}
      </Modal>

      {/* Modal thanh toán */}
      <Modal
        open={paymentModalVisible}
        title={`Thanh toán đơn hàng ${payingOrder?.id}`}
        onCancel={() => setPaymentModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setPaymentModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" loading={paymentLoading} onClick={handleConfirmPayment}>
            Xác nhận thanh toán
          </Button>,
        ]}
        width={700}
      >
        {renderPaymentContent()}
      </Modal>
    </div>
  );
};
export default OrderList;
