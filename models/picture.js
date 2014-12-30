var mongoose = require("mongoose");


var PassportSchema = mongoose.Schema({
	_id			 : mongoose.Schema.Types.ObjectId,
	PASSP_SERIES : Number,
	PASSP_NUMBER : Number,
	STATUS		 : String

});


var Passport = mongoose.model("Passport",PassportSchema);

module.exports = Passport;
