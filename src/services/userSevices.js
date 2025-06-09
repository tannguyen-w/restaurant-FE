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

export { getInfo, getAllUsers, updateUserProfile };
