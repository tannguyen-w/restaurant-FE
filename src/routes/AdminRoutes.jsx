import { Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoutes";
import AdminDashboard from "../pages/admin/dashboard";
import LayoutAdmin from "../layouts/adminLayout";
import ManageUser from "../pages/admin/manageUser";
import ManageRestaurants from "../pages/admin/manageRestaurants";
import Supplier from "../pages/admin/supplier";
import ListTable from "../pages/admin/table";
import ManageDishes from "../pages/admin/dishes";

const AdminRoutes = [
  <Route
    key="admin-dashboard"
    path="/admin"
    element={
      <PrivateRoute allowedRoles={["manager", "admin"]}>
        <LayoutAdmin />
      </PrivateRoute>
    }
  >
    <Route
      key="admin-dashboard-index"
      path="/admin/dashboard"
      element={<AdminDashboard />}
    />
    <Route key="admin-user-index" path="/admin/user" element={<ManageUser />} />
    ,
    <Route
      key="admin-restaurant-index"
      path="/admin/restaurant"
      element={<ManageRestaurants />}
    />
    ,
    <Route key="admin-supplier" path="/admin/supplier" element={<Supplier />} />
    ,
    <Route key="admin-table" path="/admin/table" element={<ListTable />} />,
    <Route key="admin-dishes" path="/admin/dishes" element={<ManageDishes />} />,
  </Route>,
];

export default AdminRoutes;
