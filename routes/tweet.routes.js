const route = require("express").Router();
const verifyToken = require("../helpers/verifyToken");

const {
  postTweet,
  getTweets,
  replyTweet,
  likeTweet,
  getTweet,
  unlikeTweet,
  getReplies,
  newsfeed,
} = require("../controllers/tweet.controller");

route.post("/", verifyToken, postTweet);

route.get("/", getTweets);

route.get("/:id", getTweet);

route.post("/reply", verifyToken, replyTweet);

route.post("/like", verifyToken, likeTweet);

route.post("/unlike", verifyToken, unlikeTweet);

route.post("/getReplies", getReplies);

route.post("/newsfeed", verifyToken, newsfeed);

module.exports = route;