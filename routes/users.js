var express = require('express');
var router = express.Router();
const User = require('../models/user');
const passport = require('passport');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('user index page' );
});


router.get('/login', (req,res,next) => {
  res.render('user/login', {title : "Login | Breadboard"});
});


router.get('/register', (req,res,next) => {
  res.render('user/register',{title : "Register | Breadboard"}); 
});

router.post('/register', (req,res,next) => {
  let errors =[]; 
  if(!req.body.name ){
    errors.push({text : 'Please enter name'}); 
  }
  if(!req.body.email ){
    errors.push({text: 'Please enter Email '}); 
  }

  if(!req.body.password){
    errors.push({text : 'Please enter password'}); 
  }
  if(!req.body.confirm_password){
    errors.push({text : 'Please enter the Password again'}); 
  }
  if( req.body.confirm_password  != req.body.password){
    errors.push({text : "Passwords do not match "});
  }
  User.find({},(err,data)=>{
    console.log(data);
  });

  if(errors.length > 0){
    res.render('user/register', {
      title : "Register | Breadboad", errors :errors,
      name: req.body.name, 
      email : req.body.email, 
      password : req.body.password
    }); 
  }else{
      User.findOne({'email' : req.body.email}, (err,user)=>{
        if(user){
          req.flash('error_msg','Email Already exists');
          console.log("user already exists");
          res.redirect('/');

        }else{
          const user = new User({
            name : req.body.name,
            email : req.body.email, 
            password : req.body.password
          }); 
          user.save((err)=>{
            if(!err){
              req.flash('success_msg',"Registration successfully" );
              console.log("user created");
              res.redirect('/users/login');
            }else{
              res.send(err);
              console.log(err);
            }
          });
        }
      });
    }
  
});


router.get('/logout', (req,res, next) =>{
  req.logout();
  res.redirect('/');

});

module.exports = router;
