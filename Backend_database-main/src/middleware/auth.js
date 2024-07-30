const jwt = require("jsonwebtoken");
const Auth = (req, res, next) => {
  const token = req.headers["token"];
  if (!token) {
    return res.status(401).json({
      message: "No token provided",
    });
  }
  try {
    const decoded = jwt.verify(token, "tokenID");
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(500).json({
      error: "Failed to authenticate token",
    });
  }
};
module.exports = Auth;
