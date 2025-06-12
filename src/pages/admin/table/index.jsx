import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllTablesByPage,
  deleteTable,
} from "../../../services/tableService";
import { Button, Table, Pagination } from "antd";
import { toast } from "react-toastify";
import { getRestaurants } from "../../../services/restaurantServices";
function ListTable() {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [totalTables, setTotalTables] = useState(0);
  const [restaurants, setRestaurants] = useState([]);
  useEffect(() => {
    fetchTables();
    fetchRestaurants();
  }, []);
  const fetchRestaurants = async () => {
    try {
      const response = await getRestaurants();
      setRestaurants(response.results);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  const fetchTables = async (page) => {
    try {
      const response = await getAllTablesByPage(page || 1);
      console.log(response);
      setTables(response.results || []);
      setTotalTables(response.totalResults || 0);
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast.error("Không thể tải danh sách bàn");
    }
  };
  const deleteTableById = async (id) => {
    try {
      await deleteTable(id);
      toast.success("Xóa bàn thành công");
      fetchTables();
    } catch (error) {
      console.error("Error deleting table:", error);
      toast.error("Không thể xóa bàn");
    }
  };
  const getRestaurantName = (restaurantId) => {
    const restaurant = restaurants.find((r) => r.id === restaurantId);
    return restaurant ? restaurant.name : "Không xác định";
  };
  const columns = [
    {
      title: "Tên bàn",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Số người",
      dataIndex: "capacity",
      key: "capacity",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Nhà hàng",
      dataIndex: "restaurant",
      key: "restaurant",
      render: (text, record) => getRestaurantName(record.restaurant),
    },
    {
      title: "Hành động",
      key: "action",
      render: (text, record) => (
        <span>
          <Button
            type="primary"
            onClick={() => navigate(`/admin/table/edit/${record.id}`)}
          >
            Sửa
          </Button>
          <Button
            type="danger"
            onClick={() => deleteTableById(record.id)}
            style={{ marginLeft: 8 }}
          >
            Xóa
          </Button>
        </span>
      ),
    },
  ];
  return (
    <div>
      <h1 className="text-black mt-5 mb-5">Danh sách bàn</h1>
      <div className="list-table-content">
        <Table
          dataSource={tables}
          columns={columns}
          rowKey="id"
          pagination={false}
        />
        <Pagination
          total={totalTables}
          // showSizeChanger
          size={10}
          onChange={(page) => {
            fetchTables(page);
          }}
          className="mt-5"
          style={{ float: "right" }}
        />
      </div>
    </div>
  );
}

export default ListTable;
