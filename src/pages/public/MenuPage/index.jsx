import { useAuth } from "../../../components/context/authContext";

import MenuDessertFood from "../../../components/MenuDessertFood";
import NavCustomer from "../../../components/NavCustomer";
import NavUser from "../../../components/NavUser";
import Footer from "../../../components/layouts/footer";
import MenuDecor from "../../../components/MenuDecor";
import MenuMainFood from "../../../components/MenuMainFood";
import MenuSoup from "../../../components/MenuSoup";
import MenuDrink from "../../../components/MenuDrink";

const MenuPage = () => {
  const { user } = useAuth();

  // Xác định navigation component an toàn
  const renderNavigation = () => {
    if (!user) return <NavUser />;
    
    if (user.role.name === "customer") {
      return <NavCustomer />;
    } else {
      return <NavUser />;
    }
  };

  return (
    <>
      {renderNavigation()}
      <MenuDessertFood />
      <MenuDecor />
      <MenuMainFood />
      <MenuSoup />
      <MenuDrink />
      <Footer />
    </>
  );
};

export default MenuPage;
