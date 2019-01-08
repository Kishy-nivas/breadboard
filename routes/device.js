var express = require('express');
var router = express.Router();
const User = require('../models/user');
const Device = require('../models/device'); 



router.get('/',(req,res) => {
	res.send("Intro about device page"); 
}); 


router.get('/new_device', (req,res) => {
	if(!req.isAuthenticated()){
		req.flash("error", "Please log in");
		res.redirect('/');
		
	
	}else{
	res.render("device/new_device", {title : "New Device | Breadboad"}); 
	}
});


router.post('/new_device',(req,res) => {
	let errors = []; 
	console.log(req.body); 
	if(!req.body.device_name){
		errors.push({text : "Please enter a unique device name "}); 
	}
	if(!req.body.device_description){
		errors.push({text: "please enter the device description"}); 
	}
	if(errors.length >0){
		res.render('device/new_device', {errors : errors}); 
	}else{
		console.log(req.body.device_name);

		Device.findOne({'device_name' : req.body.device_name},(err,device) => {
			console.log(device);
			if(device){
				errors.push({text : "Device already exists, choose a unique name "}); 
				res.render('device/new_device', {errors : errors}); 
			}else{
				const new_device = new Device({
					device_name : req.body.device_name,
					device_type : req.body.device_type,
					description : req.body.device_description
				});
				new_device.save((err)=>{
					if(!err){
						req.flash("success", "Device created successfully");
						res.redirect('/'); 
					}else{
						res.send(err);
						console.log(err); 
						
					}
				});
			}
			
		}); 
	}

	
});


router.post('/:device_id/upload', (req,res) => {

});


module.exports = router;




