"use strict";

var Buffer = require('buffer').Buffer;
var MongoClient = require('mongodb').MongoClient;
var async = require('async');
var gm = require('googlemaps');
var fs = require('fs');
var http = require('http');

// db.pictures.update({},{$unset:{geo:1}},false,true);

var one_finish_flag = false;

var isInside = function(x1,y1,x2,y2,r) {
 return (Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)) <= r*r;
};

var convert_to_degress = function(gps) {
    // """Helper function to convert the GPS coordinates stored in the EXIF to degrees in float format"""
    var d = parseFloat(gps[0]);
    var m = parseFloat(gps[1]);
    var s = parseFloat(gps[2]);
	return d + (m / 60.0) + (s / 3600.0);
};

var get_lat_lon = function(exif_gps) {
	var lon = convert_to_degress(exif_gps.GPSLongitude);
	var lat = convert_to_degress(exif_gps.GPSLatitude);
	if (exif_gps.GPSLatitudeRef != 'N') {
		lat = 0 - lat;
		//lon = convert_to_degress(exif_gps.GPSLongitude);
	};
	if (exif_gps.GPSLongitudeRef != 'E') {
		lon = 0 - lon;
	};
	return [lat,lon];
};


var setting_json = JSON.parse(fs.readFileSync("./settings.json", "utf8"));


MongoClient.connect('mongodb://localhost:27017/users', function(err, db) {
	var numCallBacks = 0;


	var q = async.queue(function (doc, callback) {

		 // CHANGE TO GEO!
		 if (!('geo.yandex_city' in doc)) {
		  // code for your update

		  var geo_yandex_city, geo_yandex_address;
		  console.log(doc.fileName);

		  /* google
		  var latlong = doc.gps.latlon[0] + ',' + doc.gps.latlon[1];
		  if (setting_json.location_provider === 'google') {
			  gm.reverseGeocode(latlong, function(err, data) {

			 	console.log(data.results[0].formatted_address);
			  	console.log(data.status);
			  	geo.google_formatted_address = data.results[0].formatted_address;

				  db.collection("pictures").update({
				    _id: doc._id
				  }, {
				    $set: {geo:geo}
				  }, {
				    w: 1
				  }, callback);
			  },false, 'ru');
		  }
		  */

		  	var latlong_yandex = doc.gps.latlon[1] + ',' + doc.gps.latlon[0];

		  	var options = {
		  	  hostname: 'geocode-maps.yandex.ru',
		  	  path: '/1.x/?results=1&format=json&geocode=' + latlong_yandex
		  	};


		  	http.request(options, function(response) {
		  		var str = '';
		  		response.setEncoding('utf8');

		  		//another chunk of data has been recieved, so append it to `str`
		  		response.on('data', function (chunk) {
		  		  str += chunk;
		  		});

		  		//the whole response has been recieved, so we just print it out here
		  		response.on('end', function () {
		  		  var yandex_response = JSON.parse(str);
		  		  console.log(latlong_yandex);
		  		  console.log(yandex_response.response.GeoObjectCollection.featureMember[0].GeoObject.description);
		  		  console.log(yandex_response.response.GeoObjectCollection.featureMember[0].GeoObject.name);
		  		  geo_yandex_city = yandex_response.response.GeoObjectCollection.featureMember[0].GeoObject.description;
		  		  geo_yandex_address = yandex_response.response.GeoObjectCollection.featureMember[0].GeoObject.name;

		  		  db.collection("pictures").update({
		  		    _id: doc._id
		  		  }, {
		  		    $set: {'geo.yandex_city' : geo_yandex_city, 'geo.yandex_address' : geo_yandex_address}
		  		  }, {
		  		    w: 1
		  		  }, callback);
		  		  
		  		});

		  	}).end();
		  

		} else callback();

	}, 1);


var qq = async.queue(function (doc, callback) {


	  var geo_computed_address = '';

	  for(var address in setting_json.locations) {
	  	//console.log(address);
	  	//console.log(setting_json.locations[address][0]);
	  	var point_x  = parseFloat(setting_json.locations[address][0]);
	  	var point_y  = parseFloat(setting_json.locations[address][1]);
	  	var target_x = parseFloat(doc.gps.latlon[0]);
	  	var target_y = parseFloat(doc.gps.latlon[1]);
	  	var radius   = parseFloat(setting_json.locations[address][2]);

	  	if (isInside(point_x,point_y,target_x,target_y,radius)) {
	  		//if (doc.fileName === 'Photo 20-05-14 12 33 31.jpg') console.log('here');
	  		geo_computed_address = address;
	  	};
	  };
	  
	  db.collection("pictures").update({
	    _id : doc._id
	  }, {
	    $set : {'geo.computed_address' : geo_computed_address}
	  }, {
	    w: 1
	  }, callback);


}, 10);




	var cursor=db.collection("pictures").find();
	cursor.each(function(err, doc) {
	  if (err) throw err;
	  if (doc) {
	  	if ('GPSLatitudeRef' in doc.gps ) {
	  		//console.log(doc.fileName);
	  		q.push(doc); // dispatching doc to async.queue
	  		qq.push(doc); // dispatching doc to async.queue

	  	}
	  }
	  //if (doc) q.push(doc); // dispatching doc to async.queue
	});

/*
	q.drain = function() {
	  if (cursor.isClosed()) {
	    console.log('all items have been processed');
	    db.close();
	  }
	};

*/

	q.drain = function() {
	  if (cursor.isClosed()) {
	  	if (one_finish_flag === true) {
	    	console.log('all items have been processed');
	    	db.close();
	    } else { one_finish_flag = true }
	  }
	};


	qq.drain = function() {
	  if (cursor.isClosed()) {
	  	if (one_finish_flag === true) {
	    	console.log('all items have been processed');
	    	db.close();
	    } else { one_finish_flag = true }
	  }
	};


});




