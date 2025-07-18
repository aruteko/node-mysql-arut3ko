const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require('../db/knex'); // knexfile.jsでMicropostを指定していること

module.exports = function(passport) {
  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const users = await db('users').where({ email });
        if (users.length === 0) {
          return done(null, false, { message: 'ユーザーが見つかりません' });
        }
        const user = users[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return done(null, false, { message: 'パスワードが違います' });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const users = await db('users').where({ id });
      done(null, users[0]);
    } catch (err) {
      done(err);
    }
  });
};