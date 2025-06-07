import { useAuth } from "../../../components/context/authContext";
import Footer from "../../../components/layouts/footer";
import NavCustomer from "../../../components/NavCustomer";
import NavUser from "../../../components/NavUser";

const ContactPage = () => {

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
    <div className="containerR">
      <h1>Contact Us</h1>
      <p>If you have any questions, feel free to reach out!</p>
      <form>
        <label htmlFor="name">Name:</label>
        <input type="text" id="name" name="name" required />
        
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" required />
        
        <label htmlFor="message">Message:</label>
        <textarea id="message" name="message" required></textarea>
        
        <button type="submit">Send</button>
      </form>
    </div>
    <Footer />
    </>
  );
}
export default ContactPage;