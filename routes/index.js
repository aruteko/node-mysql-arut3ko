const express = require('express');
const router = express.Router();
const db = require('../db/knex');

router.get('/', async function(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.redirect('/signin');
  }
  const user = req.user;
  // プロフィール画像、投稿数、フォロー数、フォロワー数取得例
  const [postCount] = await db('microposts').where({ user_id: user.id }).count('id as cnt');
  const [followingCount] = await db('relationships').where({ follower_id: user.id }).count('id as cnt');
  const [followerCount] = await db('relationships').where({ followed_id: user.id }).count('id as cnt');
  // 投稿一覧取得例
  const microposts = await db('microposts')
    .join('users', 'microposts.user_id', 'users.id')
    .select(
      'microposts.id',
      'microposts.content',
      'microposts.created_at',
      'microposts.user_id',
      'users.name as userName',
      'users.profileImage'
    )
    .orderBy('microposts.created_at', 'desc');
  res.render('index', {
    user: {
      ...user,
      profileImage: user.profileImage,
      postCount: postCount.cnt,
      followingCount: followingCount.cnt,
      followerCount: followerCount.cnt,
    },
    microposts,
    loginUser: req.user,
  });
});

router.get('/', (req, res) => {
  res.render('signin', { title: 'Sign in', error: req.flash('error') });
});

router.post('/microposts', async (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.redirect('/signin');
  }
  const user = req.user;
  const content = req.body.content;
  if (!content || content.trim() === '') {
    // 空投稿は許可しない
    return res.redirect('/');
  }
  await db('microposts').insert({
    content: content,
    user_id: user.id,
    created_at: new Date(),
    updated_at: new Date()
  });
  res.redirect('/');
});

module.exports = router;