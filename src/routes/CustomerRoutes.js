import { Route } from "react-router-dom";
import CustomerHome from "../pages/customer/Home";
import Orders from "../pages/customer/Orders";

export default function CustomerRoutes() {
  return (
    <>
      <Route path="/customer" element={<CustomerHome />} />
      <Route path="/customer/orders" element={<Orders />} />
    </>
  );
}
