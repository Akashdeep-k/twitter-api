const route = require("express").Router();
const verifyToken = require("../helpers/verifyToken");

const {
  signup,
  login,
  editInfo,
  getUser,
  verifyAuth,
  follow,
  unfollow,
  search
} = require("../controllers/auth.controller");

// get detail about a user
route.get("/", getUser);

// post signup data to register a new user
route.post("/signup", signup);

// post login data to login
route.post("/login", login);

// post data such as bio, name etc
route.post("/editprofile", verifyToken, editInfo);

// verify user auth
route.get("/verify", verifyAuth);

// Follow a user
route.post("/follow", verifyToken, follow);

//Unfollow a user
route.post("/unfollow", verifyToken, unfollow);

// Search by username
route.get("/search", search);

module.exports = route;
