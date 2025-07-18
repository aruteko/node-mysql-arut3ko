const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require("../db/knex");

// サインアップページ表示
router.get('/', (req, res) => {
  res.render('signup', { 
    title: 'Sign up', 
    error: null,
    loginUser: req.user,
   });
});

// サインアップ処理
router.post('/', async (req, res) => {
  const { name, email, password, password2 } = req.body;
  if (!name || !email || !password || password !== password2) {
    return res.render('signup', { 
      title: 'Sign up',
      error: '入力内容を確認してください。' ,
      loginUser: req.user,
    });
  }
  try {
  const hash = await bcrypt.hash(password, 10);
  const now = new Date();
  await db('users').insert({
    name,
    email,
    password: hash,
    isAdmin: 0,
    created_at: now,
    updated_at: now
  });
  res.redirect('/signin');
} catch (err) {
  res.render('signup', { 
    title: 'Sign up', 
    error: '登録に失敗しました。' ,
    loginUser: req.user,
  });
}
});

module.exports = router;