import { Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoutes";
import AdminDashboard from "../pages/admin/dashboard";

const AdminRoutes = [
  <Route
    key="admin-dashboard"
    path="/admin"
    element={
      <PrivateRoute allowedRoles={["admin"]}>
        <AdminDashboard />
      </PrivateRoute>
    }
  />
];

export default AdminRoutes;
