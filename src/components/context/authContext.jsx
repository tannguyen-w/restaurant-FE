import { createContext, useContext, useState } from "react";

export const AuthContext = createContext({
  email: "",
  phone: "",
  full_name: "",
  role: "",
  avatar: "",
  restaurant: "",
  username: "",
  id: "",
});

export const AuthWrapper = (props) => {
  const [user, setUser] = useState({
    email: "",
    phone: "",
    full_name: "",
    role: "",
    avatar: "",
    restaurant: "",
    username: "",
    id: "",
  });

  const [isAppLoading, setIsAppLoading] = useState(true);

  return (
    <AuthContext.Provider
      value={{ user, setUser, isAppLoading, setIsAppLoading }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
