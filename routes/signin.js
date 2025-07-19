const express = require('express');
const router = express.Router();
const passport = require('passport');

// サインインページ表示
router.get('/', (req, res) => {
  res.render('signin', { 
    title: 'Sign in', 
    error: req.flash('error'),
    loginUser: req.user,
  });
});

// サインイン処理
router.post('/', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/signin',
    failureFlash: true
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logout(); // コールバック不要
  req.session.destroy(() => {
    res.redirect('/signin');
  });
});

module.exports = router;