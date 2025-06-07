import { Route } from "react-router-dom";
import CustomerHome from "../pages/customer/Home";
import PrivateRoute from "./PrivateRoutes";
import Profile from "../pages/customer/profile";
import EditProfile from "../pages/customer/EditProfile";
import PersonalInfo from "../pages/customer/personalInfo";
import MyOrder from "../pages/customer/MyOrder";
import Cart from "../pages/customer/Cart";
import Checkout from "../pages/customer/Checkout";

const CustomerRoutes = [
  <Route
    key="customer-logined"
    path="/"
    element={
      <PrivateRoute allowedRoles={["customer"]}>
        <CustomerHome />
      </PrivateRoute>
    }
  />,
  <Route
    key="customer-home"
    path="/profile"
    element={
      <PrivateRoute allowedRoles={["customer"]}>
        <Profile />
      </PrivateRoute>
    }
  >
    <Route index element={<PersonalInfo />} />
    <Route path="/profile/edit" element={<EditProfile />} />
    <Route path="/profile/orders" element={<MyOrder />} />
    
  </Route>,

  <Route
    key="cart"
    path="/cart"
    element={
      <PrivateRoute allowedRoles={["customer"]}>
        <Cart />
      </PrivateRoute>
    }
  />,
  <Route
    key="checkout"
    path="/checkout"
    element={
      <PrivateRoute allowedRoles={["customer"]}>
        <Checkout />
      </PrivateRoute>
    }
  />
];

export default CustomerRoutes;
