import axios from "./axiosCustomize";

const getInfo = async () => {
  try {
    const userData = await axios.get("/user/me");
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

const getStaff = async (params) => {
  try {
    const staffData = await axios.get("/user/staffs", { params });
    return staffData;
  } catch (error) {
    console.error("Error fetching staff data:", error);
    throw error;
  }
};

const createStaff = async (userData) => {
  try {
    const response = await axios.post("/user", userData);
    return response;
  } catch (error) {
    console.error("Error creating staff:", error);
    throw error;
  }
};

const getUserById = async (id) => {
  try {
    const response = await axios.get(`/user/${id}`);
    return response;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
};

const updateStaff = async (id, userData) => {
  try {
    const response = await axios.put(`/user/${id}`, userData);
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
  getCustomers,
};
