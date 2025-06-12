import axios from "./axiosCustomize";

const getInfo = async () => {
  try {
    const userData = await axios.get("/user/me", {
      withCredentials: true, // Đảm bảo cookies được gửi trong request
    });
    return userData;
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    const usersData = await axios.get("/user");
    return usersData;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

const getStaff = async () => {
  try {
    const staffData = await axios.get("/user/staffs");
    console.log("Staff data fetched:", staffData);
    return staffData;
  } catch (error) {
    console.error("Error fetching staff data:", error);
    throw error;
  }
};

const createStaff = async (userData) => {
  let formData = new FormData();
  formData.append("username", userData.username);
  formData.append("password", userData.password);
  formData.append("role", userData.role);
  formData.append("email", userData.email);
  formData.append("full_name", userData.full_name);
  formData.append("phone", userData.phone);

  if (userData.avatar[0].originFileObj) {
    formData.append("avatar", userData.avatar[0].originFileObj);
  }
  try {
    const response = await axios.post("/user", formData);
    console.log("Staff created:", response);
    return response;
  } catch (error) {
    console.error("Error creating staff:", error);
    throw error;
  }
};

const getUserById = async (id) => {
  try {
    const response = await axios.get(`/user/${id}`);
    console.log("User data fetched by ID:", response);
    return response;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
};

const updateStaff = async (id, userData) => {
  let formData = new FormData();
  // formData.append("username", userData.username);
  // formData.append("password", userData.password);
  formData.append("role", userData.role);
  formData.append("full_name", userData.full_name);
  formData.append("email", userData.email);
  formData.append("phone", userData.phone);
  if (userData.avatar[0].originFileObj) {
    formData.append("avatar", userData.avatar[0].originFileObj);
  }
  try {
    const response = await axios.put(`/user/${id}`, formData);
    console.log("Staff update:", response);
    return response;
  } catch (error) {
    console.error("Error update staff:", error);
    throw error;
  }
};

const deleteStaff = async (id) => {
  try {
    const response = await axios.delete(`/user/${id}`);
    return response;
  } catch (error) {
    console.error("Error deleting staff:", error);
    throw error;
  }
};

const updateUserProfile = async (userData) => {
  try {
    const response = await axios.put("/user/me", userData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};
const getRoles = async () => {
  try {
    const response = await axios.get("/role");
    console.log("Roles fetched:", response);
    return response;
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
};

const getCustomers = async () => {
  try {
    const response = await axios.get("/user/customers");
    return response;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
};

export {
  getInfo,
  getAllUsers,
  updateUserProfile,
  getStaff,
  createStaff,
  getUserById,
  updateStaff,
  deleteStaff,
  getRoles,
  getCustomers,
};
