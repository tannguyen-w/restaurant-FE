import { useState } from 'react';
import { Card, Tabs, message } from 'antd';
import ImportInvoiceList from './ImportInvoiceList';
import CreateImportInvoice from './CreateImportInvoice';
import ImportInvoiceDetail from './ImportInvoiceDetail';
import InventoryReport from './InventoryReport';
import { useAuth } from '../../../components/context/authContext';

const { TabPane } = Tabs;

const WarehouseManagement = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const { user } = useAuth();
  
  // Check user permissions
  const isAdmin = user?.role.name === 'admin';
  const isManager = user?.role.name === 'manager';
  const canViewReports = isAdmin || isManager;

  const handleTabChange = (key) => {
    if (key === '1') {
      setSelectedInvoice(null);
    }
    setActiveTab(key);
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setActiveTab('3');
  };

  const handleCreateSuccess = (newInvoice) => {
    message.success('Tạo phiếu nhập kho thành công');
    setSelectedInvoice(newInvoice);
    setActiveTab('3');
  };

  const handleBack = () => {
    setActiveTab('1');
    setSelectedInvoice(null);
  };

  

  return (
    <Card title="Quản lý nhập kho" className="card-table">
      <Tabs 
        activeKey={activeTab} 
        onChange={handleTabChange}
        type="card"
      >
        <TabPane tab="Danh sách phiếu nhập" key="1">
          <ImportInvoiceList onViewInvoice={handleViewInvoice} />
        </TabPane>
        
        <TabPane tab="Tạo phiếu nhập mới" key="2">
          <CreateImportInvoice onSuccess={handleCreateSuccess} />
        </TabPane>
        
        {selectedInvoice && (
          <TabPane tab="Chi tiết phiếu nhập" key="3">
            <ImportInvoiceDetail 
              invoiceId={selectedInvoice.id} 
              onBack={handleBack}
            />
          </TabPane>
        )}

        {canViewReports && (
          <TabPane tab="Báo cáo nhập kho" key="4">
            <InventoryReport />
          </TabPane>
        )}
      </Tabs>
    </Card>
  );
};

export default WarehouseManagement;