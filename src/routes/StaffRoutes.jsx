import { Route } from "react-router-dom";
import Dashboard from "../pages/Staff/Dashboard";
import PrivateRoute from "./PrivateRoutes";

const StaffRoutes = [
  <Route
    key="staff-logined"
    path="/staff"
    element={
      <PrivateRoute allowedRoles={["staff"]}>
        <Dashboard />
      </PrivateRoute>
    }
  />,
];

export default StaffRoutes;
