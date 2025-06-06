import { useAuth } from "../../../components/context/authContext";

import NavUser from "../../../components/NavUser";
import LayoutDefault from "../../../layouts/customerLayout";
import NavCustomer from "../../../components/NavCustomer";

const HomePublic = () => {
 const {user} = useAuth();
  return (
    <>
      {user.role.name === "customer" ? <NavCustomer /> : <NavUser />}
      <LayoutDefault />
    </>
  );
};
export default HomePublic;
