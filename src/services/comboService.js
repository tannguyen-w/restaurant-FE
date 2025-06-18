
import axios from "./axiosCustomize";

const getComboItems = async (comboId) => {
  try {
    const response = await axios.get(`/combo/${comboId}`);
    return response;
  } catch (error) {
    console.error("Error fetching combo details:", error);
    throw error;
  }
}

const updateComboItem = async (comboId, quantity) => {
  try {
    const response = await axios.put(`/combo/${comboId}`, { quantity: quantity });
    return response;
  } catch (error) {
    console.error("Error updating combo details:", error);
    throw error;
  }
}

const createComboItem = async (data) => {
try {
    const response = await axios.post(`/combo`, data);
    return response;
  } catch (error) {
    console.error("Error updating combo details:", error);
    throw error;
  }}

  const deleteComboItem = async (comboId) => {
    try {
      const response = await axios.delete(`/combo/${comboId}`);
    return response;
  } catch (error) {
    console.error("Error updating combo details:", error);
    throw error;
  }}



export { getComboItems, updateComboItem, createComboItem, deleteComboItem };