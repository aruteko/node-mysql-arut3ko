const express = require('express');
const router = express.Router();
const knex = require('../db/knex');

router.get('/', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  knex("posts")
    .select("posts.*", "users.name as username")
    .leftJoin("users", "posts.user_id", "users.id")
    .orderBy("posts.created_at", "desc")
    .then(function (results) {
      res.render('index', {
        title: 'Mini Twitter',
        posts: results,
        isAuth: isAuth,
        user: req.user,
      });
    })
    .catch(function (err) {
      console.error(err);
      res.render('index', {
        title: 'Mini Twitter',
        posts: [],
        isAuth: isAuth,
        errorMessage: [err.sqlMessage],
      });
    });
});

router.post('/', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  if (!isAuth || !req.user) {
    res.redirect('/signin');
    return;
  }
  const userId = req.user.id;
  const content = req.body.content;
  knex("posts")
    .insert({user_id: userId, content: content, created_at: new Date()})
    .then(function () {
      res.redirect('/');
    })
    .catch(function (err) {
      console.error(err);
      res.render('index', {
        title: 'Mini Twitter',
        posts: [],
        isAuth: isAuth,
        errorMessage: [err.sqlMessage],
      });
    });
});

router.use('/signup', require('./signup'));
router.use('/signin', require('./signin'));
router.use('/logout', require('./logout'));
//router.use('/', require('./profile'));

module.exports = router;