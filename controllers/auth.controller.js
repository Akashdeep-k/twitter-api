const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const emitter = require("../events");

let SECRET = process.env.JWT_SECRET;

const signup = async (req, res) => {
  try {
    let { username, email, password } = req.body,
      createdAt = new Date();

    // check if user already exists or not
    let user = await User.findOne({
      $or: [{ username: req.body.username }, { email: req.body.email }],
    });

    if (user) {
      return res.status(400).send("User already exists!");
    }

    // save the user to database
    let newUser = new User({ username, email, password, createdAt });
    newUser
      .save()
      .then((response) => {
        jwt.sign(
          {
            user: response,
          },
          SECRET,
          (err, token) => {
            if (err) {
              return res.send("an error occurred");
            }

            res.json({ token });
          }
        );
        //res.status(200).send("User saved!");
      })
      .catch((e) => {
        res.status(400).send("An error occurred!");
      });
  } catch (err) {
    res.send("Could not Sign Up");
  }
};

const login = async (req, res) => {
  let { username, password } = req.body;

  User.authenticate(username, password, (e, user) => {
    if (user) {
      jwt.sign(
        {
          user: user,
        },
        SECRET,
        (err, token) => {
          if (err) {
            return res.send("an error occurred");
          }

          res.json({ token });
        }
      );
    } else {
      res.sendStatus("403");
    }
  });
};

const editInfo = async (req, res) => {
  // verify user stored in local storage and user in database
  jwt.verify(req.token, SECRET, async (err, auth) => {
    if (err) {
      console.log(err);
      return res.sendStatus("403");
    }
    let user = await User.findOne({ email: auth.user.email });

    if (user.password !== auth.user.password) {
      return res.sendStatus("403");
    }

    User.findOneAndUpdate(
      { _id: user._id },
      { $set: { additionalData: req.body } },
      { new: true }
    ).then((response) => {
      return res.sendStatus("200");
    });
  });
};

const getUser = async (req, res) => {
  let { username, userID } = req.query;
  let user = username
    ? await User.findOne({ username })
    : userID
      ? await User.findById(userID)
      : false;

  if (!user) return res.sendStatus("404");

  res.json(user);
};

const verifyAuth = (req, res) => {
  let { JWT_TOKEN } = req.query;

  jwt.verify(JWT_TOKEN, process.env.JWT_SECRET, async (err, auth) => {
    if (err) return res.sendStatus("403");
    let user = await User.findById(auth.user._id);

    if (user.password !== auth.user.password) return res.sendStatus("403");

    return res.json(user);
  });
};

const follow = (req, res) => {
  let { userToBeFollowed } = req.query;

  jwt.verify(req.token, SECRET, async (err, auth) => {
    if (err) res.sendStatus("403");

    let user = await User.findById(auth.user._id);

    if (user.password === auth.user.password) {
      User.findOneAndUpdate(
        { _id: userToBeFollowed },
        { $push: { followers: auth.user._id } },
        { new: true }
      )
        .then((response) => {
          User.findOneAndUpdate(
            { _id: auth.user._id },
            { $push: { following: userToBeFollowed } },
            { new: true }
          )
            .then((response_two) => {
              emitter.emit("follow", user.username, userToBeFollowed);
              res.send(response_two);
            })
            .catch((e) => {
              res.send(e);
            });
        })
        .catch((e) => {
          res.send(e);
        });
    }
  });
};

const unfollow = (req, res) => {
  let { userToBeUnFollowed } = req.query;

  jwt.verify(req.token, SECRET, async (err, auth) => {
    if (err) res.sendStatus("403");

    let user = await User.findById(auth.user._id);

    if (user.password === auth.user.password) {
      User.findOneAndUpdate(
        { _id: userToBeUnFollowed },
        { $pull: { followers: auth.user._id } },
        { new: true }
      )
        .then((response) => {
          User.findOneAndUpdate(
            { _id: auth.user._id },
            { $pull: { following: userToBeUnFollowed } },
            { new: true }
          )
            .then((response_two) => {
              res.send(response_two);
            })
            .catch((e) => {
              res.send(e);
            });
        })
        .catch((e) => {
          res.send(e);
        });
    }
  });
};

const search = async (req, res) => {
  let query = req.query.q;
  let users = await User.find({ $text: { $search: query } });
  return res.send(users);
};

module.exports = {
  signup,
  login,
  editInfo,
  getUser,
  verifyAuth,
  follow,
  unfollow,
  search,
};
