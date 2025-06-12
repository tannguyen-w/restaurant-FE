import { Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoutes";
import AdminDashboard from "../pages/admin/dashboard";
import LayoutAdmin from "../layouts/adminLayout";
import ManageUser from "../pages/admin/manageUser";
import AddUser from "../pages/admin/manageUser/add";
import ManageRestaurants from "../pages/admin/manageRestaurants";
import AddRestaurants from "../pages/admin/manageRestaurants/add";
import Supplier from "../pages/admin/supplier";
import AddSupplier from "../pages/admin/supplier/add";
import ListTable from "../pages/admin/table";
import AddTable from "../pages/admin/table/add";

const AdminRoutes = [
  <Route
    key="admin-dashboard"
    path="/admin"
    element={
      <PrivateRoute allowedRoles={["admin"]}>
        <LayoutAdmin>
          <AdminDashboard />
        </LayoutAdmin>
      </PrivateRoute>
    }
  />,
  <Route
    key="admin-user-index"
    path="/admin/user/list"
    element={
      <PrivateRoute allowedRoles={["admin"]}>
        <LayoutAdmin>
          <ManageUser />
        </LayoutAdmin>
      </PrivateRoute>
    }
  />,
  <Route
    key="admin-user-add"
    path="/admin/users/add"
    element={
      <PrivateRoute allowedRoles={["admin"]}>
        <LayoutAdmin>
          <AddUser />
        </LayoutAdmin>
      </PrivateRoute>
    }
  />,
  <Route
    key="admin-user-update"
    path="/admin/users/:id"
    element={
      <PrivateRoute allowedRoles={["admin"]}>
        <LayoutAdmin>
          <AddUser />
        </LayoutAdmin>
      </PrivateRoute>
    }
  />,
  <Route
    key="admin-restaurant-index"
    path="/admin/restaurant/list"
    element={
      <PrivateRoute allowedRoles={["admin"]}>
        <LayoutAdmin>
          <ManageRestaurants />
        </LayoutAdmin>
      </PrivateRoute>
    }
  />,
  <Route
    key="admin-restaurant-add"
    path="/admin/restaurant/add"
    element={
      <PrivateRoute allowedRoles={["admin"]}>
        <LayoutAdmin>
          <AddRestaurants />
        </LayoutAdmin>
      </PrivateRoute>
    }
  />,
  <Route
    key="admin-restaurant-add"
    path="/admin/restaurant/:id"
    element={
      <PrivateRoute allowedRoles={["admin"]}>
        <LayoutAdmin>
          <AddRestaurants />
        </LayoutAdmin>
      </PrivateRoute>
    }
  />,
  <Route
    key="admin-supplier-list"
    path="/admin/supplier/list"
    element={
      <PrivateRoute allowedRoles={["admin"]}>
        <LayoutAdmin>
          <Supplier />
        </LayoutAdmin>
      </PrivateRoute>
    }
  />,
  <Route
    key="admin-supplier-add"
    path="/admin/supplier/add"
    element={
      <PrivateRoute allowedRoles={["admin"]}>
        <LayoutAdmin>
          <AddSupplier />
        </LayoutAdmin>
      </PrivateRoute>
    }
  />,
  <Route
    key="admin-supplier-add"
    path="/admin/supplier/:id"
    element={
      <PrivateRoute allowedRoles={["admin"]}>
        <LayoutAdmin>
          <AddSupplier />
        </LayoutAdmin>
      </PrivateRoute>
    }
  />,
  <Route
    key="admin-table-list"
    path="/admin/table/list"
    element={
      <PrivateRoute allowedRoles={["admin"]}>
        <LayoutAdmin>
          <ListTable />
        </LayoutAdmin>
      </PrivateRoute>
    }
  />,
  <Route
    key="admin-table-add"
    path="/admin/table/add"
    element={
      <PrivateRoute allowedRoles={["admin"]}>
        <LayoutAdmin>
          <AddTable />
        </LayoutAdmin>
      </PrivateRoute>
    }
  />,
  <Route
    key="admin-table-add"
    path="/admin/table/edit/:id"
    element={
      <PrivateRoute allowedRoles={["admin"]}>
        <LayoutAdmin>
          <AddTable />
        </LayoutAdmin>
      </PrivateRoute>
    }
  />,
];

export default AdminRoutes;
