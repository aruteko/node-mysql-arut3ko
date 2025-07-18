const express = require('express');
const router = express.Router();
const knex = require('../db/knex');

router.get('/:username', async function (req, res, next) {
  const username = req.params.username;
  const user = await knex('users').where({name: username}).first();
  if (!user) {
    res.status(404).send('ユーザーが見つかりません');
    return;
  }
  // デフォルト値
  const profile_image = user.profile_image || '/images/default.png';
  const bio = user.bio || '新規ユーザー';
  // そのユーザーの投稿
  const posts = await knex('posts')
    .where({user_id: user.id})
    .orderBy('created_at', 'desc');
  res.render('profile', {
    user,
    profile_image,
    bio,
    posts
  });
});

module.exports = router;