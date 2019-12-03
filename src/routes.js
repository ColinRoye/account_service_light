const express = require("express");
const app = express();
const router = require("express").Router();
const debug = require("./debug");
const env = require("./env");
const service = require("./services");


router.post('/adduser', async (req, res, next) => {
  let body = req.body;
  let ret = await service.addUser(body.username, body.password, body.email);

  if (ret.status == env.statusError) {
    ret.status.error = "anything"
    res.status("400").send(ret.status)
  } else {
    res.send(ret.status);
  }
});
router.post('/verify', async (req, res, next) => {
  let body = req.body
  debug.log("ROUTES: verification key " + body.key)
  debug.log("ROUTES: email " + body.email)
  debug.log("ROUTES: body " + JSON.stringify(body))
  let ret = await service.verify(body.email, body.key);

  if (ret.status == env.statusError) {
    ret.status.error = "anything"
    res.status("400").send(ret.status)
  } else {
    res.send(ret.status);
  }
})
router.post('/login', async (req, res, next) => {
  let body = req.body;
  let ret = await service.login(body.username, body.password);
  debug.log(ret.status)
  ret.status.error = "anything"
  if (ret.status == env.statusOk) {
    res.cookie("auth", body.username);
    res.send(ret.status);

  } else {
    res.status("400").send(ret.status);
  }
})
router.get('/login/:email/:password/:username', async (req, res, next) => {
  let params = req.params
  ret = await service.login(params.username, params.password, params.email);
  if (ret.status === env.statusOk) {
    res.cookie("auth", body.username);
  }
  res.send(ret.status);
})

router.get('/account/:username', async (req, res, next) => {
  let args = req.params;
  let ret = await service.getEmail(args.username);
  debug.log(ret)


  res.send(ret);
})
router.get('/logout', async (req, res, next) => {
  let params = req.params
  //ret = await service.logout();
  //if(ret.status === env.statusOk){
  res.cookie("auth", "");
  //}
  res.send(env.statusOk);
})

router.get('/auth', async (req, res, next) => {
  console.log("test")
  res.send("test: " + req.cookies["auth"]);
})



router.get('/user/:username/followers', async (req, res, next) => {
  service.getFollowers(req, res)
});
router.get('/user/:username/following', async (req, res, next) => {
  service.getFollowing(req, res)
});
router.get('/user/:username', async (req, res, next) => {
  service.getUser(req, res);
});
router.get('/user/:username/posts', async (req, res, next) => {
  service.getPosts(req, res)
});

router.post('/follow', async (req, res, next) => {
  if (req.cookies["auth"]) {
    service.determineFollow(req, res);

  } else {
    res.status("400").send({
      "status": "error"
    });
  }
});





module.exports = router