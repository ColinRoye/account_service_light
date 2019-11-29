
module.exports={
     domain: "cs.stonybrook.edu",
     verifyEmailBody:(key)=>{
          return 'validation key: <'+key+'>';
     },
     verifySubject: "Please verify your email!",
     verifyAdmin: ()=>{return "auth@" + module.exports.domain},
     verifyEmail: (key,email)=>{
          return {
               from: module.exports.verifyAdmin(),
               to: email,
               subject: module.exports.verifySubject,
               text: module.exports.verifyEmailBody(key),
          };
     },
     debugEmail: "croye@cs.stonybrook.edu",
     statusOk: {"status": "OK"},
     statusError: {"status":"error"},
     mongoUrl:'mongodb://130.245.170.225:27017/docker-node-mongo'

}
