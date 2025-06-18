import axios from "./axiosCustomize";

const getRoles = async () => {
  try {
    const response = await axios.get("/role");
    return response;
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
}

export {getRoles}