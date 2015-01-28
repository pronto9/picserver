var //Passport = require("../models/passport.js"),
	fs = require('fs'),
	querystring = require('querystring'),
	MongoClient = require('mongodb').MongoClient,
	PictureController = {};


PictureController.getCollectionIndex = function(req, res) {
	var db = req.db;
	/*
	db.pictures.aggregate(
	   [
	     {
	       $group:
	         {
	          _id: "$collectionName",
		      events: { $addToSet:  { eventName: "$eventName"} }
	         }
	     }
	   ]
	)


	db.pictures.aggregate(
	   [
	     {
	       $group:
	         {
	          _id: "$collectionName",
		      events: { $addToSet:  { eventName: "$eventName"} }
	         }
	     },
	     {
	     	$unwind : "$events"
	     },
	     {
	     	$sort: 
	     	{_id:1,
	     	events : -1
	    	}
	     },
	     {
	       $group:
	         {
	          _id: "$_id",
		      events: { $addToSet:  { eventName: "$events.eventName"} }
	         }
	     }
	   ]
	).pretty()




	*/
//	db.collection('pictures').aggregate([{"$group":{"_id": "$collectionName","events": { "$addToSet":  { "eventName": "$eventName"}}}}],function(err, results) {
//    db.collection('pictures').aggregate([{"$group":{"_id": "$collectionName", "events": { "$addToSet":  { "eventName": "$eventName"}}}}, {"$sort": {"_id": 1,"events":1	}}],function(err, results) {		
    db.collection('pictures').aggregate([{
	     $group:
	         {
	          _id: "$collectionName",
		      events: { $addToSet:  { eventName: "$eventName"} }
	         }
	     },
	     {
	     	$unwind : "$events"
	     },
	     {
	     	$sort: 
	     	{_id:1,
	     	events : -1
	    	}
	     },
	     {
	       $group:
	         {
	          _id: "$_id",
		      events: { $addToSet:  { eventName: "$events.eventName"} }
	         }
	     }
	   ],function(err, results) {		
		console.log(results);
		res.json(results);
	});
};




PictureController.getCollection = function(req, res) {
	var collectionname = req.params.COLLECTIONNAME;
	var eventname = req.params.EVENTNAME;
	var db = req.db;

	db.collection('pictures').find({'collectionName' : collectionname, 'eventName' : eventname})
	.sort({'image.ModifyDate' : 1})
	.toArray(function(err, results) {
		results.forEach(function(item) {
			item.fullthumbnailfilename = querystring.escape(item.fullthumbnailfilename);
		});
		//console.log(results);
		res.json(results);
	});
};





//module.exports = PassportController;

module.exports.PictureController = PictureController;
// module.exports.databaseStatus = databaseStatus;

/*
module.exports = 
	{PassportController  : PassportController,
	consistencyCheckDate : consistencyCheckDate};
*/
