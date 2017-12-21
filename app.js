require('./config/config');

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');

var {mongoose} = require('./db/mongoose');
var {frontView} = require('./routes/index');
var {api} = require('./routes/api');

// init App
var app = express();
const port = process.env.PORT;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: false,
    resave: false
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

app.use('/', frontView);
app.use('/api', api);

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {app}; // for test purpose
