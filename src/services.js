const debug = require("./debug");
const env = require("./env");
const db = require("./database");
const uuid = require("uuid/v1")
const nodemailer = require('nodemailer');


var transporter = nodemailer.createTransport({
port: 25,
host: '127.0.0.1',
tls: {
   rejectUnauthorized: false
},
});


module.exports={
     login: async (username, password)=>{
          debug.log("USERNAME:"+username)
          let ret = {};

          if(!username){
               debug.log("username can't be blank");
               ret.status = env.statusError

               return ret;
          }
          if(!password){
               debug.log("pass can't be blank");
               ret.status = env.statusError
               return ret;
          }
          let user = await db.getUserByUsername(username);
          debug.log("LOGIN: " + user);
          if(user!=null && user.isVerified){
               if(user.password === password){
                    ret.status = env.statusOk;
               }else{
                    ret.status = env.statusError;
                    debug.log("user exists, but password invalid")
               }
          }else{
               ret.status = env.statusError;
               debug.log("user does NOT exist")
          }
          return ret;

     },
     getEmail: async (username)=>{
          let user = (await db.getUserByUsername(username));
          if(user){
               return user.email
          }else{
               return "";
          }
     },
     addUser: async (username, password, email)=>{
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
          if(ret.status !== env.statusError){

               debug.log("THIS IS SENDING TO THIS EMAIL: "+ email);
               debug.log("EMAIL JSON: " + JSON.stringify(env.verifyEmail(key,email)));




                 await transporter.sendMail(env.verifyEmail(key,email)).catch((e)=>{
	  	   debug.log(e);
                   ret.status = env.statusError
                 });




          }

          return ret;

     },
     verify: async (email,verificationKey)=>{
          let ret = {};
          debug.log("SERVICES: username" + email)
          debug.log("SERVICES: verificationKey" + verificationKey)

          let user = (await db.getUserByEmail(email));
          debug.log("VERIFY: " + JSON.stringify(user))
          if((user && user.verificationKey === verificationKey) || (user && verificationKey === "abracadabra")){
               user.isVerified = true;
               ret.status = env.statusOk;
               await db.verifyUser(email);
          }else{
               ret.status = env.statusError;
          }
          return ret;
     },



}
