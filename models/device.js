const mongoose = require("mongoose"); 
const AutoIncrement = require('mongoose-sequence')(mongoose);
var Schema = mongoose.Schema; 

const DeviceSchema = new Schema({
	_id : Number, 
	device_name : {
		type : String, required : true
	},
	device_type :{
		type : String,  enum : ["Arduino", "Raspberry Pi"], default : "Arduino"
	}, 
	status : {
		type : String , enum :["active", "in active"], default : "in active"
	}, 
	created_at : {
		type : Date, 
		default : Date.now() 
		
	},
	values : [ new Schema({
			key : {type : String}, 
			value :{type : String },
			created_at : {type : Date, default : Date.now() }
		},{ _id : false}); 
		
	], 
	owner : {
		type : Schema.Types.ObjectId, ref :'User'
	}, 
	description : {
		type : String, required : true 
	}
	
}, {_id : false });

DeviceSchema.plugin(AutoIncrement);

Const Device = mongoose.model('Device', DeviceSchema); 
module.export = Device; 

