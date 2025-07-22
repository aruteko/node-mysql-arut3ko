const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
  req.logout();
  res.redirect("/");
  res.render('signin', {
    user: req.user,
    error: errorMessage,
    loginUser: req.user,
  });
});

module.exports = router;