import axios from "./axiosCustomize";

const login = async (username, password) => {
  try {
    const response = await axios.post("/login", { username, password });
    return response; // Server chỉ trả về { user }, không có tokens
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

const logout = async () => {
  try {
    return await axios.post("/logout");
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
};

const registerUser = async (userData) => {
  try {
    const response = await axios.post("/user/register", userData);
    return response; // Server chỉ trả về { user }, không có tokens
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
};

export { login, logout, registerUser };
