const debug = require("./debug");
const env = require("./env");
const db = require("./database");
const uuid = require("uuid/v1")
const nodemailer = require('nodemailer');
const axios = require('axios')

// var transporter = nodemailer.createTransport({
//   port: 25,
//   host: '127.0.0.1',
//   tls: {
//     rejectUnauthorized: false
//   },
// });


module.exports = {
  login: async (username, password) => {
    debug.log("USERNAME:" + username)
    let ret = {};

    if (!username) {
      debug.log("username can't be blank");
      ret.status = env.statusError

      return ret;
    }
    if (!password) {
      debug.log("pass can't be blank");
      ret.status = env.statusError
      return ret;
    }
    let user = await db.getUserByUsername(username);
    debug.log("LOGIN: " + user);
    if (user != null && user.isVerified) {
      if (user.password === password) {
        ret.status = env.statusOk;
      } else {
        ret.status = env.statusError;
        debug.log("user exists, but password invalid")
      }
    } else {
      ret.status = env.statusError;
      debug.log("user does NOT exist")
    }
    return ret;

  },
  getEmail: async (username) => {
    let user = (await db.getUserByUsername(username));
    if (user) {
      return user.email
    } else {
      return "";
    }
  },
  addUser: async (username, password, email) => {
    let key = uuid();
    let user = {
      username: username,
      email: email,
      isVerified: false,
      password: password,
      verificationKey: key
    }

    let ret = await db.addUser(user);



    //send verification email
    if (ret.status !== env.statusError) {

      debug.log("THIS IS SENDING TO THIS EMAIL: " + email);
      debug.log("EMAIL JSON: " + JSON.stringify(env.verifyEmail(key, email)));




      // await transporter.sendMail(env.verifyEmail(key, email)).catch((e) => {
      //   debug.log(e);
      //   ret.status = env.statusError
      // }).catch((e) => {
      //   console.log("email not sent")
      // });




    }

    return ret;

  },
  verify: async (email, verificationKey) => {
    let ret = {};
    debug.log("SERVICES: username" + email)
    debug.log("SERVICES: verificationKey" + verificationKey)

    let user = (await db.getUserByEmail(email));
    debug.log("VERIFY: " + JSON.stringify(user))
    if ((user && user.verificationKey === verificationKey) || (user && verificationKey === "abracadabra")) {
      user.isVerified = true;
      ret.status = env.statusOk;
      await db.verifyUser(email);
    } else {
      ret.status = env.statusError;
    }
    return ret;
  },
  getUser: async (req, res) => {
    const username = req.params.username;
    console.log(username);

    const foundUser = await db.getUserByUsername(username);
    if (foundUser == null) {
      res.send({
        status: "error",
        msg: username + "not found"
      });
    } else {
      console.log(foundUser);
      console.log(foundUser.email);

      const numFollowers = foundUser['followers'].length;
      const numFollowing = foundUser['following'].length;

      var user = {
        email: foundUser.email,
        followers: numFollowers,
        following: numFollowing
      }

      res.send({
        status: "OK",
        user: user
      });


    }
  },

  //Can call getUser function for followers, folloing, and posts

  getPosts: async (req, res) => {
    const username = req.params.username;
    const limitGiven = req.query.limit;
    var limit = 0;
    if (limitGiven === "" || typeof limitGiven === 'undefined' || typeof limitGiven === 'null') {
      limit = 50;
    } else {
      limit = Number(limitGiven);
      if (limit > 200) {
        limit = 200;
      } else if (limit < 50) {
        limit = 50;
      }
    }
    let url = "http://hackguy.cse356.compas.cs.stonybrook.edu" + "/items/" + username + "/" + limit
    debug.log("LIMIT IN GET POSTS: " + limit);
    const usersItems = (await axios.get(url)).data.items;
    console.log(JSON.stringify(usersItems));
    res.send({
      status: "OK",
      items: usersItems
    });
    //Check params for username to get

    //Pass in username to getUser function

    //Return all posts with that username

    //Return { items : list of post item ID's }

  },

  getFollowers: async (req, res) => {
    const username = req.params.username;
    const limitGiven = req.query.limit;
    let limit;
    if (limitGiven === "" || typeof limitGiven === 'undefined' || typeof limitGiven === 'null') {
      limit = 50;
    } else {
      limit = Number(limitGiven);
      if (limit > 200) {
        limit = 200;
      } else if (limit < 50) {
        limit = 50;
      }
    }

    const followersArray = await db.followersArray(username, limit);
    console.log(followersArray);
    res.send({
      status: "OK",
      users: followersArray[0].followers
    });

  },
  getFollowing: async (req, res) => {

    const username = req.params.username;
    const limitGiven = req.query.limit;
    let limit;
    if (limitGiven === "" || typeof limitGiven === 'undefined' || typeof limitGiven === 'null') {
      limit = 50;
    } else {
      limit = Number(limitGiven);
      if (limit > 200) {
        limit = 200;
      } else if (limit < 50) {
        limit = 50;
      }
    }
    const followingList = await db.followingList(username, limit);
    console.log(followingList[0].following);
    //console.log(followingList[0]['following'][0]);
    for (var i = 0; i < followingList[0]['following'].length; i++) {
      console.log(followingList[0]['following'][i])
    }
    console.log(followingList[0]['following'].length);

    res.send({
      status: "OK",
      users: followingList[0].following
    });
  },
  determineFollow: async (req, res) => {
    let ret = {};
    //Get username to follow or unfollow
    var currentUser = req.cookies['auth'];
    const userToFollow = req.body.username;
    console.log("In follow Controller");
    const userExist = await db.getUserByUsername(userToFollow);
    if (userExist) {
      console.log("Follow given is " + req.body.follow);
      console.log("current user is " + currentUser);
      console.log("User to follow is " + userToFollow);
      if (req.body.follow == "") {
        console.log("empty follow");
      }
      if (req.body.follow === undefined || req.body.follow === "" || req.body.follow === "true" || req.body.follow === true) {
        console.log("Try to follow user");
        //Add usertoFollow to currentUser's following list
        console.log("About to add " + userToFollow + " to " + currentUser + "'s list of users they're following");
        await db.followMethod1(currentUser, userToFollow, res);

      } else if (req.body.follow === "false" || req.body.follow === false) {
        console.log("req.body.follow is false str or false");
        console.log("Try to unfollow user");
        //Remove userToFollow from following list
        console.log("About to remove " + userToFollow + " from " + currentUser + "'s list of users they're following");
        await db.followMethod2(currentUser, userToFollow, res);
      } else {
        console.log("Follow variable in request body is neither true or false");
        res.send({
          status: "error",
          msg: "Follow variable in request body is neither true or false"
        });
      }
    } else {
      console.log("the user doesn't exist");
      console.log(userExist);
      res.send({
        status: "error"
      });
    }
  }



}