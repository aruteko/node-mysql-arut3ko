const express = require('express');
const router = express.Router();
const db = require("../db/knex");

router.post('/:micropostId', async (req, res) => {
  if (!req.user) return res.status(401).send('ログインしてください');
  const userId = req.user.id;
  const micropostId = req.params.micropostId;

  // すでにいいねしているか確認
  const exists = await db('likes')
    .where({ user_id: userId, micropost_id: micropostId })
    .first();

  if (exists) {
    // いいねを取り消す
    await db('likes')
      .where({ user_id: userId, micropost_id: micropostId })
      .del();
  } else {
    // いいねを追加
    await db('likes').insert({
      user_id: userId,
      micropost_id: micropostId,
      created_at: new Date()
    });
  }
  res.redirect('back');
});

module.exports = router;