import { Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoutes";
import AdminDashboard from "../pages/admin/dashboard";
import LayoutAdmin from "../layouts/adminLayout";
import ManageUser from "../pages/admin/manageUser";
import AddUser from "../pages/admin/manageUser/add";
import ManageRestaurents from "../pages/admin/manageRestaurants";
import AddRestaurants from "../pages/admin/manageRestaurants/add";

const AdminRoutes = [
  <Route
    key="admin-dashboard"
    path="/admin/dashboard"
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
          <ManageRestaurents />
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
];

export default AdminRoutes;
