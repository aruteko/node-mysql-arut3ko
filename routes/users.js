const express = require('express');
const router = express.Router();
const db = require('../db/knex');

// フォロー一覧ページ
router.get('/:id/following', async (req, res) => {
  const userId = req.params.id;

  // ユーザ情報取得
  const user = await db('users').where({ id: userId }).first();
  const [postCount] = await db('microposts').where({ user_id: userId }).count('id as cnt');
  const [followingCount] = await db('relationships').where({ follower_id: userId }).count('id as cnt');
  const [followerCount] = await db('relationships').where({ followed_id: userId }).count('id as cnt');

  // フォローしているユーザ一覧取得
  const followingUsers = await db('relationships')
    .join('users', 'relationships.followed_id', 'users.id')
    .where('relationships.follower_id', userId)
    .select('users.id', 'users.name');

  res.render('following', {
    user: {
      ...user,
      postCount: postCount.cnt,
      followingCount: followingCount.cnt,
      followerCount: followerCount.cnt
    },
    followingUsers,
    loginUser: req.user,
  });
});

// フォロワー一覧ページ
router.get('/:id/followers', async (req, res) => {
  const userId = req.params.id;

  // ユーザ情報取得
  const user = await db('users').where({ id: userId }).first();
  const [postCount] = await db('microposts').where({ user_id: userId }).count('id as cnt');
  const [followingCount] = await db('relationships').where({ follower_id: userId }).count('id as cnt');
  const [followerCount] = await db('relationships').where({ followed_id: userId }).count('id as cnt');

  // フォロワーユーザ一覧取得
  const followerUsers = await db('relationships')
    .join('users', 'relationships.follower_id', 'users.id')
    .where('relationships.followed_id', userId)
    .select('users.id', 'users.name');

  res.render('followers', {
    user: {
      ...user,
      postCount: postCount.cnt,
      followingCount: followingCount.cnt,
      followerCount: followerCount.cnt
    },
    followerUsers,
    loginUser: req.user,
  });
});

// プロフィールページ
router.get('/:id', async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const loginUser = req.user;

  // ユーザ情報取得
  const user = await db('users').where({ id: userId }).first();
  if (!user) return res.status(404).send('User not found');

  // 投稿数・フォロー数・フォロワー数
  const [postCount] = await db('microposts').where({ user_id: userId }).count('id as cnt');
  const [followingCount] = await db('relationships').where({ follower_id: userId }).count('id as cnt');
  const [followerCount] = await db('relationships').where({ followed_id: userId }).count('id as cnt');

  // 投稿一覧
  const microposts = await db('microposts')
    .where({ user_id: userId })
    .orderBy('created_at', 'desc');

  // フォロー状態判定
  let isFollowing = false;
  if (loginUser && loginUser.id !== userId) {
    const rel = await db('relationships')
      .where({ follower_id: loginUser.id, followed_id: userId })
      .first();
    isFollowing = !!rel;
  }

  res.render('profile', {
    user: {
      ...user,
      postCount: postCount.cnt,
      followingCount: followingCount.cnt,
      followerCount: followerCount.cnt
    },
    microposts,
    loginUser,
    isFollowing 
  });
});

router.post('/:id/follow', async (req, res) => {
  const followerId = req.user.id;
  const followedId = parseInt(req.params.id, 10);
  if (followerId === followedId) return res.redirect(`/users/${followedId}`);
  // すでにフォローしていなければ追加
  const exists = await db('relationships')
    .where({ follower_id: followerId, followed_id: followedId })
    .first();
  if (!exists) {
    const now = new Date();
    await db('relationships').insert({
      follower_id: followerId,
      followed_id: followedId,
      created_at: now,
      updated_at: now
    });
  }
  res.redirect(`/users/${followedId}`);
});

// アンフォロー
router.post('/:id/unfollow', async (req, res) => {
  const followerId = req.user.id;
  const followedId = parseInt(req.params.id, 10);
  await db('relationships')
    .where({ follower_id: followerId, followed_id: followedId })
    .del();
  res.redirect(`/users/${followedId}`);
});

// プロフィールページ
router.get('/:id', async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const loginUser = req.user;

  // ユーザ情報取得
  const user = await db('users').where({ id: userId }).first();
  if (!user) return res.status(404).send('User not found');

  // 投稿数・フォロー数・フォロワー数
  const [postCount] = await db('microposts').where({ user_id: userId }).count('id as cnt');
  const [followingCount] = await db('relationships').where({ follower_id: userId }).count('id as cnt');
  const [followerCount] = await db('relationships').where({ followed_id: userId }).count('id as cnt');

  // 投稿一覧
  const microposts = await db('microposts')
    .where({ user_id: userId })
    .orderBy('created_at', 'desc');

  // フォロー状態判定
  let isFollowing = false;
  if (loginUser && loginUser.id !== userId) {
    const rel = await db('relationships')
      .where({ follower_id: loginUser.id, followed_id: userId })
      .first();
    isFollowing = !!rel;
  }

  res.render('profile', {
    user: {
      ...user,
      postCount: postCount.cnt,
      followingCount: followingCount.cnt,
      followerCount: followerCount.cnt
    },
    microposts,
    loginUser,
    isFollowing,
    loginUser: req.user,
  });
});

router.get('/', async (req, res) => {
  const loginUser = req.user;
  const users = await db('users').select('id', 'name', 'isAdmin');
  res.render('users', { 
    users, 
    loginUser,
    loginUser: req.user,
  });
});

// ユーザ削除
router.post('/:id/delete', async (req, res) => {
  const loginUser = req.user;
  const userId = parseInt(req.params.id, 10);
  if (!loginUser || !loginUser.isAdmin) {
    return res.status(403).send('Forbidden');
  }
  await db('users').where({ id: userId }).del();
  res.redirect('/users');
});
module.exports = router;