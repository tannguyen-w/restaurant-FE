import { BrowserRouter as Router, Routes } from "react-router-dom";
import PublicRoutes from "./routes/PublicRoutes";
import CustomerRoutes from "./routes/CustomerRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import StaffRoutes from "./routes/StaffRoutes";
import ManagerRoutes from "./routes/ManagerRoutes";
import { useContext, useEffect } from "react";
import { getMe } from "./services/user.service";
import { AuthContext } from "./components/context/auth.context";
import { Spin } from "antd";

const App = () => {
  const { setUser, isAppLoading, setIsAppLoading } = useContext(AuthContext);

  useEffect(() => {
    fetchUserInfo();
    // eslint-disable-next-line
  }, []);

  const fetchUserInfo = async () => {
    const res = await getMe();
    if (res.data) {
      setUser(res.data.user);
    }
    setIsAppLoading(false);
  };

  if (isAppLoading) {
    return (
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <Spin />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <PublicRoutes />
        <CustomerRoutes />
        <AdminRoutes />
        <StaffRoutes />
        <ManagerRoutes />
      </Routes>
    </Router>
  );
};

export default App;
