const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db/knex');

// ユーザ情報変更ページ表示
router.get('/edit', async (req, res) => {
  if (!req.user) return res.redirect('/signin');
  const user = await db('users').where({ id: req.user.id }).first();
  res.render('edit_account', { user, error: null });
});

// ユーザ情報更新処理
router.post('/edit', async (req, res) => {
  if (!req.user) return res.redirect('/signin');
  const { name, email, password, password2 } = req.body;
  if (!name || !email || (password && password !== password2)) {
    return res.render('edit_account', { user: req.body, error: '入力内容を確認してください。' });
  }
  try {
    const updateData = {
      name,
      email,
      updated_at: new Date()
    };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    await db('users').where({ id: req.user.id }).update(updateData);
    res.redirect(`/users/${req.user.id}`);
  } catch (err) {
    res.render('edit_account', { user: req.body, error: '更新に失敗しました。' });
  }
});

module.exports = router;