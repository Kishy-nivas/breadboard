var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/about', (req,res,next) =>{
	res.render('about', {title :'About | Breadboard'}); 
});

module.exports = router;
