import React,{useState, useEffect} from 'react';
import { Button, Table, Pagination } from "antd";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAllSuppliers, deleteSupplier } from "../../../services/supplierService";

function Supplier() {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [totalSuppliers, setTotalSuppliers] = useState(0);
    useEffect(() => {
        fetchSuppliers();
    }, []);
    const fetchSuppliers = async () => {
        try {
            const response = await getAllSuppliers();
            setSuppliers(response.results || []);
            setTotalSuppliers(response.totalResults || 0);
        } catch (error) {
            console.error("Error fetching suppliers:", error);
            toast.error("Không thể tải danh sách nhà cung cấp");
        }
    }
    const handleDelete = async (id) => {
        try {
            await deleteSupplier(id);
            toast.success("Xóa nhà cung cấp thành công");
            fetchSuppliers(); // Refresh the supplier list
        } catch (error) {
            console.error("Error deleting supplier:", error);
            toast.error("Không thể xóa nhà cung cấp");
        }
    };
    const columns = [
        {
            title: "Tên nhà cung cấp",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Địa chỉ",
            dataIndex: "address",
            key: "address",
        },{
            title: "Email",
            dataIndex: "contact",
            key: "contact",
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
        },
        {
            title: "Hành động",
            key: "action",
            render: (text, record) => (
                <span>
                    <Button type="primary" onClick={() => navigate(`/admin/supplier/${record.id}`)}>Sửa</Button>
                    <Button type="danger" onClick={() => handleDelete(record.id)} style={{ marginLeft: 8 }}>Xóa</Button>
                </span>
            ),
        },
    ];
    const handChangePage = (page) => {
        // Logic to handle page change can be added here
        console.log("Current Page:", page);
        // You can fetch suppliers for the selected page if your API supports pagination
    }
    return ( 
        <div className="supplier-page">
            <h1 className="text-black mt-5 mb-5">Quản lý nhà cung cấp</h1>
            <p className="text-gray-500 mb-5">Danh sách các nhà cung cấp của cửa hàng</p>
            <div className="supplier-list">
                <Table 
                    dataSource={suppliers} 
                    columns={columns} 
                    rowKey="id" 
                    pagination={false} 
                />
                <Pagination 
                defaultCurrent={1} 
                total={totalSuppliers} 
                size={20}
                className='mt-5'style={{float: "right"}} 
                onChange={handChangePage}/>
            </div>
        </div>
     );
}

export default Supplier;