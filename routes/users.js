var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('user index page' );
});


router.get('/login', (req,res,next) => {
  res.render('user/login', {title : "Login | Breadboard"});
});

router.post('/login', (req,res,next) => {
  console.log(req.body); 
  res.send("login post received");
});

router.get('/register', (req,res,next) => {
  res.render('user/register',{title : "Register | Breadboard"}); 
});

router.post('/register', (req,res,next) => {
	console.log(req.body); 
	res.send("user post recived");
  
});


router.get('/logout', (req,res, next) =>{
  res.send('user logout page')
});

module.exports = router;
