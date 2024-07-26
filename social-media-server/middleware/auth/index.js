const jwt = require("jsonwebtoken");

const SECRET_KEY = "your-secret-key";

// Middleware to authenticate JWT
const verifyToken = (token) => {
  try {
    const verified = jwt.verify(token, SECRET_KEY);
    return verified;
  } catch (err) {
    return null;
  }
};
const authenticateJWT = (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ status: "error", message: "Access denied" });
  }

  const verified = verifyToken(token);
  if (!verified) {
    return res.status(400).json({ status: "error", message: "Invalid token" });
  }

  req.user = verified;
  next();
};

module.exports = {
  verifyToken,
  authenticateJWT,
};