const jwt = require("jsonwebtoken");

const tokenVerification = (req, res, next) => {
  try {
    const token = req.headers["authorization"];
    if (!token) {
        next();
        return;
      }
    try {
      const decodedToken = jwt.verify(token, "verysecurekey");
      req.userId = decodedToken.userId;
      console.log(req.userId);
      next();
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  } catch (error) {
    res.status(401).json({ error: error });
  }
};

module.exports = tokenVerification;
