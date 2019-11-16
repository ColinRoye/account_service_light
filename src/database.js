var mongoose = require('mongoose');
var User = mongoose.model("User");
const env = require("./env");
const debug = require("./debug");



module.exports={
     getUserByUsername: async(username)=>{
          return await User.findOne({username: username})
     },
     getUserByEmail: async(email)=>{
          return await User.findOne({email: email})
     },
     verifyUser: async(email)=>{
          let ret = {};
          let user = await User.findOne({email: email});
          debug.log("Retrieved User: " + user)
          if(user!=null){
               user.isVerified = true;
               user.save();
               ret.status = env.statusOk;
          }else{
               ret.status = env.statusError;
               debug.log("user NOT found for verifiaction");
          }
          return ret;

     },
     addUser: async(user)=>{
          let ret = {};
          emailExists = await module.exports.getUserByEmail(user.email);
          usernameExists = await module.exports.getUserByUsername(user.username);
          if(!emailExists && !usernameExists){
               let userDoc = new User;
               userDoc.email = user.email;
               userDoc.username = user.username;
               userDoc.isVerified = false,
               userDoc.password = user.password,
               userDoc.verificationKey = user.verificationKey
               debug.log("made it to addUser db")
               debug.log(JSON.stringify(user))
               userDoc.save();
               ret.status = env.statusOk;
          }else{
               debug.log("username or password taken");
               ret.status = env.statusError;

          }
          return ret;
     }
}
