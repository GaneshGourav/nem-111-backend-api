const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];
  if (token) {
    jwt.verify(token, "ganesh", (err, decoded) => {
      if (decoded) {
        let date = new Date().toLocaleString();
        req.body = {
          ...req.body,
          username: decoded.username,
          userId: decoded.userId,
          date: date,
        };
        next();
      } else {
        res.status(400).json({ msg: "Please Login" });
      }
    });
  } else {
    res.status(400).json({ msg: "Please Login" });
  }
};

module.exports = { auth };
