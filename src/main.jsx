import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthWrapper } from "./components/context/authContext.jsx";
import { CartProvider } from "./components/context/cartContext";

import "./scss/main.scss";
import { ConfigProvider } from "antd";
import "./assets/styles/antdConfig.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthWrapper>
    <CartProvider>
      <ConfigProvider
        theme={{
          token: {
            colorText: "#000",
            colorSuccess: "#52c41a",
            colorError: "#ff4d4f",
          },
          components: {
            Message: {
              colorText: "#000",
              colorBgElevated: "#fff",
            },
          },
        }}
      >
        <App />
      </ConfigProvider>
    </CartProvider>
  </AuthWrapper>
);
