var //Passport = require("../models/passport.js"),
	fs = require('fs'),
	querystring = require('querystring'),
	MongoClient = require('mongodb').MongoClient,
	PictureController = {};


PictureController.gettestJSON = function(req, res) {
	var data = [
	    { image: querystring.escape('Pictures/2014/20140216 - Работа/Photo18.jpg') }
	];

	console.log(data);
	res.json(data);
};

PictureController.getCollectionIndex = function(req, res) {
	var data = [2012,2013,2014];
	res.json(data);
};

PictureController.getCollection = function(req, res) {
	var collectionname = req.params.COLLECTIONNAME;
	var eventname = req.params.EVENTNAME;
	var db = req.db;

	db.collection('pictures').find({'collectionName' : collectionname, 'eventName' : eventname}).toArray(function(err, results) {
		results.forEach(function(item) {
			item.fullfileName = querystring.escape(item.fullfileName);
		});
		console.log(results);
		res.json(results);
	});

/*
	db.collection('pictures').insert({'zko':'hi'}, function(err, result) {
	    if (err) {
	    	console.log('error');
	    }
	    console.log('ok');
	});
	
	var data = [
	    { image: querystring.escape('Pictures/2014/20140216 - Работа/IMG_0004.JPG') },
	    { image: querystring.escape('Pictures/2014/20140216 - Работа/IMG_0005.JPG') },
	    { image: querystring.escape('Pictures/2014/20140216 - Работа/IMG_0173.JPG') }
	];
	console.log(data);
	res.json(data);
*/

};


/*
PassportController.getpassport = function(req, res) {
	var pas_series = req.params.PASSP_SERIES;
	var pas_number = req.params.PASSP_NUMBER;

	// Assync logger
	var now_date = new Date();
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	var log_event = new AccessLog({"PASSP_SERIES": pas_series, "PASSP_NUMBER": pas_number, "CLIENT_IP" : ip, "REQ_DATE" : now_date});

	log_event.save(function (err){
		if (err !== null) {
			console.log(err);
		} else {
			console.log("Log saved");
		}
	});


	function falueResponce() {
		var FALUE_RESPONCE = [ { "STATUS": "DBERROR", "PASSP_SERIES": 0, PASSP_NUMBER: 0 } ];
		res.json(FALUE_RESPONCE);
	};

	consistencyCheckCount(function(consistencyCheckCountResult) {
		if (typeof(consistencyCheckCountResult) == 'number') {
			consistencyCheckDate(function(consistencyCheckDateResult) {
				if (typeof(consistencyCheckDateResult) == 'number') {
					var command = 'grep -x ' + '"' + pas_series + ',' +  pas_number + '"' + ' ' + PASSPORTS_FILE;
					console.log(command);
					exec(command, function (error, stdout, stderr) {
						if (error !== null) {
							if (error.code === 1) {
								// grep executed, but no data found
								var NODATA_RESPONCE = [ { "STATUS": "NODATA", "PASSP_SERIES": 0, PASSP_NUMBER: 0 } ];
								res.json(NODATA_RESPONCE);
							} else	{
								// grep falue
								falueResponce();
							};
						} else {
							// grep ok
							console.log(stdout);
							var OK_RESPONCE = [ { "STATUS": "OK", "PASSP_SERIES": pas_series, PASSP_NUMBER: pas_number } ];
							res.json(OK_RESPONCE);
						};

					});
				} else {
					// consistencyCheck falue
					falueResponce();
				};
			});
		} else {
			// consistencyCheck falue
			falueResponce();
		};
	});
};

*/


//module.exports = PassportController;

module.exports.PictureController = PictureController;
// module.exports.databaseStatus = databaseStatus;

/*
module.exports = 
	{PassportController  : PassportController,
	consistencyCheckDate : consistencyCheckDate};
*/
