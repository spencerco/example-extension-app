const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const multer = require('multer');
const session = require('express-session');
const crypto = require("crypto")

const formRouter = require('./routes/form');
const adminRouter = require('./routes/admin');
const authRouter = require('./routes/auth');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const sessionSecret = crypto.randomBytes(32).toString("base64")
app.use(session({ secret: sessionSecret, cookie: { maxAge: 5 * 60 * 1e3 } }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(multer().array())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/form', formRouter);
app.use('/admin', adminRouter);
app.use('/authorize', authRouter);
app.get('/', (req, res) => res.redirect("/admin"));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  console.log(err)
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
