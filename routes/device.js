var express = require('express');
var router = express.Router();
const User = require('../models/user');


router.get('/',(req,res) => {
	res.send("Intro about device page"); 
}); 


router.get('/new_device', (req,res) => {
	if(!req.isAuthenticated()){
		req.flash("success", "Please log in");
		res.redirect('/');
		
	
	}else{
	res.render("device/new_device", {title : "New Device | Breadboad"}); 
	}
});


router.post('/new_device',(req,res) => {
	req.flash("success", "Device created successfully"); 
	console.log(req.body);
	res.redirect("/"); 
});


router.post('/:device_id/upload', (req,res) => {

});


module.exports = router;




