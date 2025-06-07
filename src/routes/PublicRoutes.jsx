import { Route } from "react-router-dom";
import HomePage from "../pages/public/HomePage";
import AboutPage from "../pages/public/AboutPage";
import LoginPage from "../pages/auth/LoginPage";
import DishDetail from "../pages/public/DishDetail";
import Register from "../pages/auth/Register";
import ResetPassword from "../pages/auth/ResetPassword";
import MenuPage from "../pages/public/MenuPage";
import Reservation from "../pages/public/Reservation";
import ContactPage from "../pages/public/ContactPage";

const PublicRoutes = [
  <Route key="home" path="/" element={<HomePage />} />,
  <Route key="home-alt" path="/home" element={<HomePage />} />,
  
  <Route key="about" path="/about" element={<AboutPage />} />,
  <Route key="contact" path="/contact" element={<ContactPage />} />,
  <Route key="login" path="/login" element={<LoginPage />} />,
  <Route key="register" path="/register" element={<Register />} />,
  <Route key="resetPassword" path="/reset-password" element={<ResetPassword />} />,
  <Route key="dishes" path="/dishes/:id" element={<DishDetail />} />,
  <Route key="menu" path="/menu" element={<MenuPage />} />,
  <Route key="reservation" path="/reservation" element={<Reservation />} />
];

export default PublicRoutes;
