import Footer from "../components/layouts/footer";
import Header from "../components/layouts/header";
import CountDown from "../components/CountDown";
import MenuChoose from "../components/MenuChoose";
import OpenTime from "../components/OpenTime";
import MenuMostPopular from "../components/MenuMostPopular";
import OrderTable from "../components/OrderTable";
import Offer from "../components/Offer";

const LayoutDefault = () => {
  return (
    <>
      <Header />
      <CountDown />
      <MenuMostPopular />
      <OpenTime />
      <MenuChoose />
      <OrderTable />
      <Offer />
      <Footer />
    </>
  );
};
export default LayoutDefault;
