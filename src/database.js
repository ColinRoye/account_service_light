var mongoose = require('mongoose');
var User = mongoose.model("User");
const env = require("./env");
const debug = require("./debug");



module.exports = {
  getUserByUsername: async (username) => {
    return await User.findOne({
      username: username
    })
  },
  getUserByEmail: async (email) => {
    return await User.findOne({
      email: email
    })
  },
  verifyUser: async (email) => {
    let ret = {};
    let user = await User.findOne({
      email: email
    });
    debug.log("Retrieved User: " + user)
    if (user != null) {
      user.isVerified = true;
      await user.save();
      ret.status = env.statusOk;
    } else {
      ret.status = env.statusError;
      debug.log("user NOT found for verifiaction");
    }
    return ret;

  },
  addUser: async (user) => {
    let ret = {};
    emailExists = await module.exports.getUserByEmail(user.email);
    usernameExists = await module.exports.getUserByUsername(user.username);
    if (!emailExists && !usernameExists) {
      let userDoc = new User;
      userDoc.email = user.email;
      userDoc.username = user.username;
      userDoc.isVerified = false,
        userDoc.password = user.password,
        userDoc.verificationKey = user.verificationKey
      debug.log("made it to addUser db")
      debug.log(JSON.stringify(user))
      await userDoc.save();
      ret.status = env.statusOk;
    } else {
      debug.log("username or password taken");
      ret.status = env.statusError;

    }
    return ret;
  },
  followersArray: async (username, limit) => {
    return await User.find({
      username: username
    }).select('-_id followers').limit(limit);
  },
  followingList: async (username, limit) => {
    return await User.find({
      username: username
    }).select('-_id following').limit(limit);
  },
  followMethod1: async (currentUser, userToFollow, res) => {
    User.update({
      username: currentUser
    }, {
      $addToSet: {
        following: userToFollow
      }
    }).exec(function(err, user) {
      if (err) {
        res.send({
          status: "error",
          msg: "Already following " + userToFollow
        });
      } else {
        //Add current user to userToFollow's followers list
        console.log("About to add " + currentUser + " to " + userToFollow + "'s list of followers");
        User.update({
          username: userToFollow
        }, {
          $addToSet: {
            followers: currentUser
          }
        }).exec(function(err, user) {
          if (err) {
            res.send({
              status: "error"
            });
          } else {
            res.send({
              status: "OK",
              msg: "You are now following " + userToFollow
            });
          }
        })
      }
    });
  },
  followMethod2: async (currentUser, userToFollow, res) => {
    User.update({
      username: currentUser
    }, {
      $pull: {
        following: userToFollow
      }
    }).exec(function(err, user) {
      if (err) {
        console.log("Error when removing " + userToFollow + " from " + currentUser + "'s list of users they're following");
        res.send({
          status: "error",
          msg: "Not following user already"
        });
      } else {
        console.log("About to remove " + currentUser + " from " + userToFollow + "'s list of followers");
        //Remove currentUser from userToFollow's followers list
        User.update({
          username: userToFollow
        }, {
          $pull: {
            followers: currentUser
          }
        }).exec(function(err, user) {
          if (err) {
            console.log("Error when removing " + currentUser + " from " + userToFollow + "'s list of followers");
            res.send({
              status: "error",
              msg: ""
            });
          } else {
            console.log("Sucessfully removed " + currentUser + " from " + userToFollow + "'s list of followers");
            res.send({
              status: "OK",
              msg: userToFollow + " unfollowed!"
            })
          }
        });
      }

    })
  }

}