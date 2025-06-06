import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthWrapper } from "./components/context/authContext.jsx";
import { CartProvider } from "./components/context/cartContext";

import "./scss/main.scss";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <AuthWrapper>
    <CartProvider>
      <App />
    </CartProvider>
  </AuthWrapper>
  // </React.StrictMode>
);
