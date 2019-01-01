var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	console.log(req.user);
  res.render('index', { title: 'Home | Breadboard' ,user: req.user, message : req.flash('success')});
});

router.get('/about', (req,res,next) =>{
	res.render('about', {title :'About | Breadboard'}); 
});

module.exports = router;
