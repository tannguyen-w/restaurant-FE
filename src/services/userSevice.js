import axios from "./axios.customize";

const getInfo = () => {
  return axios.get("user/me");
};

export { getInfo };
