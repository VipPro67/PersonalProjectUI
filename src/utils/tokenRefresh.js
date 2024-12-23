import axios from "axios";

export const refreshToken = async (navigate, setToken) => {
  try {
    const rftoken = JSON.parse(localStorage.getItem("refreshToken"));
    

    const response = await axios.post(
      "http://20.39.224.87:5000/api/auth/refresh",
      { refreshToken: rftoken }
    );
    const newTokens = {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    };
    setToken(newTokens);
    return newTokens.accessToken;
  } catch (error) {
    console.error("Error refreshing token:", error);
    localStorage.removeItem("auth");
    navigate("/login");
    return null;
  }
};

export const handleTokenError = async (
  error,
  navigate,
  setToken,
  retryCallback
) => {
  if (error.response && error.response.status === 401) {
    const newToken = await refreshToken(navigate, setToken);
    if (newToken && retryCallback) {
      return retryCallback(newToken);
    }
  } else {
    throw error;
  }
};
