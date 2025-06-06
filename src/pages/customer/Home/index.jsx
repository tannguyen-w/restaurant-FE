
import NavCustomer from "../../../components/NavCustomer";
import LayoutDefault from "../../../layouts/customerLayout";
import NavUser from "../../../components/NavUser";
import { useAuth } from "../../../components/context/authContext";

const HomePage = () => {
  const { user } = useAuth();
 
  return (
    <>
      {user.role.name === "customer" ? <NavCustomer /> : <NavUser />}
      <LayoutDefault/>
    </>
  );
};

export default HomePage;
