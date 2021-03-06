var express 	= require("express"),
	bodyParser 	= require("body-parser"),
	morgan 		= require("morgan"),
	methodOverride = require("method-override"),
	PictureController = require("./controllers/picture_controller.js"),
    MongoClient = require('mongodb').MongoClient,
	app;

	app = express();


MongoClient.connect('mongodb://localhost:27017/users', function(err, db) {


	app.use(function(req,res,next) {
		req.db = db;
		next();
	});

	app.use(express.static(__dirname + "/client"));
	app.use(morgan('dev'));
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());
	app.use(methodOverride());
	app.get("/getCollectionIndex/", PictureController.PictureController.getCollectionIndex);
	app.get("/getalbum/:COLLECTIONNAME/:EVENTNAME", PictureController.PictureController.getCollection);
//	app.get("/gettestJSON/", PictureController.PictureController.gettestJSON);


app.listen(4000);
console.log('App listening on port 4000');

});