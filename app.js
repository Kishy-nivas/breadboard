var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars');
var mongoose = require('mongoose'); 
var session = require('express-session'); 
var flash = require('connect-flash');
var passport = require('passport');
const User = require('./models/user');
var bcrypt = require('bcrypt');


// database connection 

mongoose.Promise = global.Promise; 
//var mongodb = "mongodb://admin:2016272023ist@ds129904.mlab.com:29904/library-app";
var mongodb = "mongodb://127.0.0.1:27017/library-app";


mongoose.connect(mongodb,{useNewUrlParser : true}); 
var db = mongoose.connection; 
db.once('open',()=> {
  console.log("Database connection successfull");
});

db.on("error", console.error.bind(console,"Error in db ")); 

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express(); 


app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({
	extname : 'hbs', 
	defaultLayout : 'main',
	layoutsDir: __dirname +'/views/layouts/', 
	partialsDir : __dirname + '/views/partials/', 
}));


app.set('view engine', 'hbs');
app.use(flash());
app.use(session({
  secret: 'Secret',
  resave: true,
  saveUninitialized: true,
}));
// import passport and passport-local strategy
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// add local authentication strategy with a verification function
passport.use(new LocalStrategy(function(username, password, cb) {
  // Locate user first here
  bcrypt.compare(password, user.password, function(err, res) {
    if (err) return cb(err);
    if (res === false) {
      return cb(null, false);
    } else {
      return cb(null, user);
    }
  });
}));
// initialize passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


// configure my-login route to authenticate using added "local" strategy
// if a user is logged in, send him back a message
app.post('/users/login',
  // wrap passport.authenticate call in a middleware function
 

  function (req, res, next) {
    // call passport authentication passing the "local" strategy name and a callback function
    console.log(req.body);
    passport.authenticate('local', function (error, user, info) {
      // this will execute in any case, even if a passport strategy will find an error
      // log everything to console
      console.log(error);
      console.log(user);
      console.log(info);

      if (error) {
        res.status(401).send(error);
      } else if (!user) {
        res.status(401).send(info);
      } else {
        next();
      }

      res.status(401).send(info);
    })(req, res);
  },

  // function to call once successfully authenticated
  function (req, res) {
    res.status(200).send('logged in!');
  });


app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
