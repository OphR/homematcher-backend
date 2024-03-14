require('dotenv').config()
require('./models/connection')
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var realtysRouter = require('./routes/realtys');
var usersRouter = require('./routes/users');
var matchRouter = require('./routes/match');
var notifRouter = require('./routes/notification');

var app = express();
const cors = require('cors');
app.use(cors())

const fileUpload = require('express-fileupload');
app.use(fileUpload());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/realtys', realtysRouter);
app.use('/users', usersRouter);
app.use('/match',matchRouter);
app.use('/notification',notifRouter);

module.exports = app;
