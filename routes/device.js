var express = require('express');
var router = express.Router();
const User = require('../models/user');


router.get('/',(req,res) => {
	res.send("Intro about device page"); 
}); 


router.get('/new_device', (req,res) => {
	res.render("device/new_device"); 
});


router.post('/new_device',(req,res) => {
	req.flash("success", "Device created successfully"); 
	console.log(req.body);
	res.redirect("/"); 
});


router.post('/:device_id/upload', (req,res) => {

});


module.exports = router;




