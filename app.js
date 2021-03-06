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
var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://broker.hivemq.com:1883');
//var client = mqtt.connect('mqtt://localhost:1883');
const Device = require('./models/device'); 
const PORT = 3000; 
const five = require('johnny-five'); 
const board = new five.Board(); 

const engine = require('json-rules-engine').default(); 

engine.addRule({
	conditions : {
		any: [{
			all: [{
				fact : 'value', 
				operator : 'greaterThanInclusive', 
				value :  100
			}]
		}]
	}, 
	event : {
		type : 'temperatureReached', 
		params : {
			message : 'Temperature has reached max threshold'
		}
	}
}); 
function isValidJSON(msg){
	
	try{
		JSON.parse(msg); 
	} catch(e){
		console.log(e);
		return false;

	}
	return true; 
}


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
			if(err) return cb(err); 
			if(!user) return cb(null,false,req.flash('error', 'user does not exists ')); 
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
var app = express(); 
var http = require('http').Server(app);  // bind the app with the http server 
var io = require('socket.io')(http);  // bind the socket with the http 

io.on("connection", function(socket){
    socket.on("disconnect",()=>{
        console.log("a user disconnected ");
    });
    console.log("A new  user connected");
});


client.on('connect', function () {
	console.log("connected with mqtt");
	client.subscribe('device_data', function (err) {
	  if (!err) {
	  	console.log("subscribed to device data"); 
	  	client.publish("message", "hello world");
	  }else{
	  	console.log(err);
	  }
	})
  })
  
  
  client.on('message', function (topic, message) {
	// message is Buffer
  // var data = JSON.parse(message);  
  
  console.log("in message");
   if(isValidJSON(message)){
 
	  var device_data = JSON.parse(message); 
	  const value = {"key" : device_data.key, "value" : device_data.value}; 
	  var socket_link = `message/${device_data.id}`; 
	  io.emit(socket_link, value);
	  console.log("server side link  " + socket_link);
	 /*
	  Device.findOneAndUpdate({_id : device_data.id}, {$push: {values: value}},{upsert: true,save : true},function(err,done){
		  if(err) console.log(err);
		  else { 
		  		console.log(" new data saved");
		  		var socket_link = `message/${device_data.id}`; 
				  io.emit(socket_link, value);
			
				  
	  		}
	  });
	  */
  
   }else{
	   console.log("Invalid JSON format");
   }
  
  });
  

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var deviceRouter = require('./routes/device'); 







app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({
	extname : 'hbs', 
	defaultLayout : 'main',
	layoutsDir: __dirname +'/views/layouts/', 
	partialsDir : __dirname + '/views/partials/', 
}));


app.set('view engine', 'hbs');
app.use(logger('dev'));

app.use(bodyParser.urlencoded({extended : false})); 
app.use(bodyParser.json());
app.use(require('express-session')({ 
	secret: 'top secret', 
	resave: true, 
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.get('/', function(req, res, next) {
	if(req.user){
		app.locals.user = req.user;
	}
	
  res.render('index', { title: 'Home | Breadboard' , success: req.flash('success'),error : req.flash('error')});
});


app.get('/login',(req,res) =>{	
	if(req.user){
		req.flash("success", "You are logged in already");
		res.redirect('/');
		return;
	}
	res.render('user/login',{message : req.flash('error'), title : "Login | Breadboad"});
});

app.post('/login',passport.authenticate('local',{failureRedirect : '/login', successRedirect: '/' ,
	failureFlash : true		
		}
));


	
app.get('/logout',
	(req,res)=>{
		req.logout();
		app.locals.user = null;
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
app.use('/device', deviceRouter);

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



board.on('ready', ()=>{
	const temperatureSensor = new five.Sensor({
		pin :'A4',
		threshold : 4
	}); 
	
	temperatureSensor.on('change',(value)=>{
		//console.log(value); 
		let mv = ( value/1024.0)*5000;
		let cel = mv/10;
		let data = `{"key" : "temperature", "value" : "${cel}", "id" : "5c78d53afa92bd0ca34d0d7d"}`;
		let engine_data = {value : cel}; 
		engine 
			.run(engine_data)
			.then(events => {
				events.map(event => console.log(event.params.message))
			});
		console.log(data);
		const value1 = {"key" : data.key, "value" : data.value}; 
	  	var socket_link = `message/${data.id}`;
	  	io.emit(socket_link,value1); 
		client.publish('device_data' , data); 
		/*
		setTimeout(function(){
			let data = `{"key" : "temperature", "value" : "${cel}", "id" : "5c714052dcffad1bbc69490d"}`;
			client.publish('device_data' , data); 
		},3000); 
		
	});
	*/ 
	
	});
}); 


/*


five.Board().on("ready", function() {
  var temperature = new five.Thermometer({
    controller: "LM35",
    pin: "A0"
  });

  temperature.on("change", function() {
    console.log(this.celsius + "°C", this.fahrenheit + "°F");
  });
});

let engine = new Engine(); 



*/


http.listen(PORT,()=>{
    console.log("listening on " + PORT); 
})
