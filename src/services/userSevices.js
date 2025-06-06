import axios from "./axiosCustomize";

const getInfo = async () => {
   try {
    const userData = await axios.get("/user/me", {
      withCredentials: true // Đảm bảo cookies được gửi trong request
    });
    console.log("User data fetched:", userData);
    return userData;
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    const usersData = await axios.get("/user");
    console.log("All users data fetched:", usersData);
    return usersData;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

const updateUserProfile = async ( userData) => {
  try {
    const response = await axios.put(`/user/me`, userData);
    console.log("User profile updated:", response);
    return response;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export { getInfo, getAllUsers, updateUserProfile };
