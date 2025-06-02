import { Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUserList from "../pages/admin/AdminUserList";

const AdminRoutes = () => (
  <>
    <Route
      path="/admin/dashboard"
      element={
        <PrivateRoute allowedRoles={["admin"]}>
          <AdminDashboard />
        </PrivateRoute>
      }
    />
    <Route
      path="/admin/users"
      element={
        <PrivateRoute allowedRoles={["admin"]}>
          <AdminUserList />
        </PrivateRoute>
      }
    />
  </>
);

export default AdminRoutes;
