var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars');
var mongoose = require('mongoose'); 
var session = require('express-session'); 
var passport = require('passport');
const User = require('./models/user');
var bcrypt = require('bcrypt');
const uuid = require('uuid/v4');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const LocalStrategy = require('passport-local').Strategy; 
const flash = require('express-flash'); 


// database connection 

mongoose.Promise = global.Promise; 
var mongodb = "mongodb://admin:2016272023ist@ds129904.mlab.com:29904/library-app";
//var mongodb = "mongodb://127.0.0.1:27017/library-app";


// passport- Authentication module 

passport.use(new LocalStrategy({
	  passReqToCallback: true
	},
	function(req,username,password,cb){
		User.findOne({'name' : username},(err,user)=>{
			console.log(user);
			if(err) return cb(err); 
			if(!user) return cb(null,false,req.flash('error', 'user does not exists ')); 
			console.log(password);
			console.log(user.password);
			bcrypt.compare(password,user.password,function (err,res){
				console.log(res);
				if(res==true) return cb(null,user,req.flash('success', `Welcome, ${user.name} you have logged in successfully`)); 
				else return cb(null,false,req.flash('error', 'password do not match')); 
			});
		});
	}
));

passport.serializeUser(function(user,cb){
	cb(null,user._id);
});


passport.deserializeUser(function(id,cb){
	User.findById(id,(err,user)=>{
		if(err) return cb(err); 
		else return cb(null,user);
	});
});

mongoose.connect(mongodb,{useNewUrlParser : true}); 
var db = mongoose.connection; 
db.once('open',()=> {
  console.log("Database connection successfull");
});

db.on("error", console.error.bind(console,"Error in db ")); 

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express(); 



app.use(flash());
app.use(bodyParser.urlencoded({extended : false})); 
app.use(bodyParser.json());
app.use(require('express-session')({ 
	secret: 'top secret', 
	resave: true, 
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({
	extname : 'hbs', 
	defaultLayout : 'main',
	layoutsDir: __dirname +'/views/layouts/', 
	partialsDir : __dirname + '/views/partials/', 
}));


app.set('view engine', 'hbs');

app.get('/login',(req,res) =>{	
	res.render('user/login',{message : req.flash('error')});
});

app.post('/login',passport.authenticate('local',{failureRedirect : '/login', successRedirect: '/' ,
	failureFlash : true		
		}
));


	
app.get('/logout',
	(req,res)=>{
		req.logout();
		req.flash('success', "you have logged out successfully");
		res.redirect('/');
	}
);



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
