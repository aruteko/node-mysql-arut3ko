const express = require('express');
const router = express.Router();
const db = require('../db/knex');

router.get('/', async function(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.redirect('/signin');
  }
  const user = req.user;
  const [postCount] = await db('microposts').where({ user_id: user.id }).count('id as cnt');
  const [followingCount] = await db('relationships').where({ follower_id: user.id }).count('id as cnt');
  const [followerCount] = await db('relationships').where({ followed_id: user.id }).count('id as cnt');
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

  // いいね情報付与
  const likedRows = await db('likes').where('user_id', user.id);
  const likedMap = new Set(likedRows.map(like => like.micropost_id));
  microposts.forEach(post => {
    post.liked = likedMap.has(post.id);
  });

  // いいね数を集計
  const micropostIds = microposts.map(post => post.id);
  let likeCounts = [];
  if (micropostIds.length > 0) {
    likeCounts = await db('likes')
      .whereIn('micropost_id', micropostIds)
      .select('micropost_id')
      .count('id as cnt')
      .groupBy('micropost_id');
  }
  const likeCountMap = {};
  likeCounts.forEach(row => {
    likeCountMap[row.micropost_id] = row.cnt;
  });
  microposts.forEach(post => {
    post.likeCount = likeCountMap[post.id] || 0;
  });

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
    updated_at: new Date(),
  });
  res.redirect('/');
});

router.delete('/:id', async (req, res) => {
  const postId = req.params.id;
  // 投稿が自分のものか確認
  const post = await db('microposts').where({ id: postId }).first();
  if (!post || post.user_id !== req.user.id) {
    return res.status(403).send('Forbidden');
  }
  await db('microposts').where({ id: postId }).del();
  res.redirect('/');
});

router.get('/search', async (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.redirect('/signin');
  }
  const user = req.user;
  const query = req.query.q || '';
  let microposts = [];
  if (query) {
    microposts = await db('microposts')
      .join('users', 'microposts.user_id', 'users.id')
      .select(
        'microposts.id',
        'microposts.content',
        'microposts.created_at',
        'microposts.user_id',
        'users.name as userName',
        'users.profileImage'
      )
      .where('microposts.content', 'like', `%${query}%`)
      .orderBy('microposts.created_at', 'desc');
  }

  // いいね情報付与
  const likedRows = await db('likes').where('user_id', user.id);
  const likedMap = new Set(likedRows.map(like => like.micropost_id));
  microposts.forEach(post => {
    post.liked = likedMap.has(post.id);
  });

  // 必要なカウント情報も取得
  const [postCount] = await db('microposts').where({ user_id: user.id }).count('id as cnt');
  const [followingCount] = await db('relationships').where({ follower_id: user.id }).count('id as cnt');
  const [followerCount] = await db('relationships').where({ followed_id: user.id }).count('id as cnt');

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
    query, // 検索ワードをテンプレートに渡す
  });
});

module.exports = router;