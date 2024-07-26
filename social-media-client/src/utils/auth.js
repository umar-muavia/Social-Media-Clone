export const isTokenExpired = () => {
  const token = localStorage.getItem("token");
  if (!token) return true;

  const expiryTime = parseJwt(token).exp * 1000; // Convert expiry time to milliseconds
  return Date.now() > expiryTime;
};

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (err) {
    return null;
  }
};
