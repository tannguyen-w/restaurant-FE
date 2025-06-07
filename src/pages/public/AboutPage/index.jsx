import { useAuth } from "../../../components/context/authContext";
import Footer from "../../../components/layouts/footer";
import NavCustomer from "../../../components/NavCustomer";
import NavUser from "../../../components/NavUser";

const AboutPage = () => {
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
      <div className="containerR">AboutPage</div>

      <Footer />
    </>
  );
};
export default AboutPage;
