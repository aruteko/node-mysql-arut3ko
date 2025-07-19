const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const methodOverride = require('method-override');
const { toJapanTimeString } = require('./utils/timeUtils');

// タイムゾーンを日本時間に設定
//process.env.TZ = 'Asia/Tokyo';

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// EJSテンプレートで使用するユーティリティ関数をlocalsに設定
app.locals.toJapanTimeString = toJapanTimeString;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(methodOverride('_method')); // HTTPメソッドのオーバーライドを有効化

// セッションの設定
app.use(session({
  secret: 'secret_key', 
  resave: false,
  saveUninitialized: false
}));

// passportの初期化
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// router
app.use('/', require('./routes/index'));
app.use('/signup', require('./routes/signup'));
app.use('/signin', require('./routes/signin'));
app.use('/users', require('./routes/users'));
app.use('/accounts', require('./routes/accounts'));
app.use('/microposts', require('./routes/index'));
app.use('/likes', require('./routes/likes'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;