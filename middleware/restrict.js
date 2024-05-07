import jwt from "jsonwebtoken";
const TOKEN_KEY = process.env.TOKEN_KEY || "areallylonggoodkey";

const restrict = (req, res, next) => {
  function valid(err, user) {
    req.user = user;
    next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (jwt.verify(token, TOKEN_KEY, {}, valid)) {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(403).send("Unauthorized");
  }
};

export default restrict;
