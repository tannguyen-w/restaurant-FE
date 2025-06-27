import { Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoutes";

import AdminDashboard from "../pages/admin/dashboard";
import LayoutAdmin from "../layouts/adminLayout";
import ManageUser from "../pages/admin/manageUser";
import ManageDishes from "../pages/admin/dishes";
import ManageTable from "../pages/admin/table";
import Supplier from "../pages/admin/supplier";
import ManageRestaurant from "../pages/admin/manageRestaurants";
import RecipeManagement from "../pages/admin/dishIngredient";
import IngredientManagement from "../pages/admin/ingredient";
import WarehouseManagement from "../pages/admin/warehouse";
import AdminReservationList from "../pages/admin/reservation/AdminReservationList";
import AdminOrderList from "../pages/admin/order/AdminOrderList";

const AdminRoutes = [
  <Route
    key="admin-dashboard"
    Add
    commentMore
    actions
    path="/admin"
    element={
      <PrivateRoute allowedRoles={["manager", "admin"]}>
        <LayoutAdmin />
      </PrivateRoute>
    }
  >
    <Route key="admin-dashboard" path="/admin/dashboard" element={<AdminDashboard />} />
    <Route key="admin-user" path="/admin/user" element={<ManageUser />} />
    ,
    <Route key="admin-restaurant" path="/admin/restaurant" element={<ManageRestaurant />} />
    ,
    <Route key="admin-supplier" path="/admin/supplier" element={<Supplier />} />
    ,
    <Route key="admin-table" path="/admin/table" element={<ManageTable />} />,
    <Route key="admin-dishes" path="/admin/dishes" element={<ManageDishes />} />
    ,
    <Route key="admin-ingredient" path="/admin/ingredient" element={<IngredientManagement />} />
    ,
    <Route key="admin-recipes" path="/admin/recipes" element={<RecipeManagement />} />
    ,
    <Route key="admin-warehouse" path="/admin/warehouse" element={<WarehouseManagement />} />
    <Route key="admin-reservation" path="/admin/reservation" element={<AdminReservationList />} />
    <Route key="admin-order" path="/admin/order" element={<AdminOrderList />} />
  </Route>,
];

export default AdminRoutes;
