import { Route } from "react-router-dom";
import Dashboard from "../pages/Staff/Dashboard";
import PrivateRoute from "./PrivateRoutes";
import OrderList from "../pages/Staff/Order/orderList";
import OrderAdd from "../pages/Staff/Order/orderAdd";
import ReservationList from "../pages/Staff/Reservation/ReservationList";
import ReservationAdd from "../pages/Staff/Reservation/ReservationAdd";

const StaffRoutes = [
  <Route
    key="staff-logined"
    path="/staff"
    element={
      <PrivateRoute allowedRoles={["staff"]}>
        <Dashboard />
      </PrivateRoute>
    }
  >
    <Route key="staff-orderList" path="/staff/order" element={<OrderList />} />,
    <Route key="staff-orderAdd" path="/staff/order/add" element={<OrderAdd />} />,
    <Route key="staff-reservationList" path="/staff/reservation" element={<ReservationList />} />,
    <Route key="staff-reservationAdd" path="/staff/reservation/add" element={<ReservationAdd />} />,
  </Route>,
];

export default StaffRoutes;
