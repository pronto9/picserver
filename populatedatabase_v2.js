"use strict";

var ExifImage = require('exif').ExifImage;
var dir = require('node-dir');
var sha1 = require('sha1');
var Buffer = require('buffer').Buffer;
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var gm = require('gm');
var path = require('path');
var mkdirp = require('mkdirp');
//var lwip = require('lwip');

// db.pictures.ensureIndex({sha1:1},{unique:1});


var PIC_INPUTFOLDER = '/home/zko/picserver/client/Pictures';
var PIC_THUMBNAILSFOLDER = '/home/zko/picserver/client/Thumbnails';
var MONDO_UNIQUE_INDEX_VIOLATION = 11000;
var THUMBNAIL_FILE_ADDON = ' thumb';

var files_filtered = [];

var setting_json = JSON.parse(fs.readFileSync("./settings.json", "utf8"));


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
	var lon = convert_to_degress(exif_gps.GPSLongitude);;
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



MongoClient.connect('mongodb://localhost:27017/users', function(err, db) {
	var numCallBacks = 0;


	dir.paths(PIC_INPUTFOLDER, function(err, paths) {
	    if (err) throw err;

	    paths.files.forEach(function(file) {

	    	var filePath = file.split(path.sep);
	    	var eventName = filePath[filePath.length-2];
	    	var collectionName = filePath[filePath.length-3];
	    	var rootPictureFolder = filePath[filePath.length-4];

	    	//check if Pictures/coolection/event/pic.jpg structure 
	    	if (filePath[filePath.length-4] === path.basename(PIC_INPUTFOLDER)) {
	    		//skip excluded folders
	    		if (setting_json.exclude_directorys.indexOf(collectionName) === -1) {
	    			//	console.log(collectionName);
	    			if (path.extname(file).toUpperCase() === ('.JPG' || '.JPEG' )) {
	    				files_filtered.push(file);
	    			}
	    		}
	    	}
	    });

	    	    	
	    console.log('***** second phase *******');
	    console.log(files_filtered);

	    files_filtered.forEach(function(file) {

	    	var filePath = file.split(path.sep);
	    	var eventName = filePath[filePath.length-2];
	    	var collectionName = filePath[filePath.length-3];
	    	var rootPictureFolder = filePath[filePath.length-4];

	    			try { 
		    			    new ExifImage({ image : file }, function (error, exifData) {
		    			        if (error)
		    			            console.log('Error: ' + error.message);
		    			        else {
					        	    fs.readFile(file, function (err, data) {
					        	    	if (err) throw err;
					        	    	var buf = new Buffer(data, 'binary');
					        			console.log(file);
					        			if ('Artist' in exifData.image) exifData.image.Artist = exifData.image.Artist.trim();
					        			if ('Copyright' in exifData.image) exifData.image.Copyright = exifData.image.Copyright.trim();
					        			if ('MakerNote' in exifData.image) delete exifData.image.MakerNote;
					        			if ('makernote' in exifData) delete exifData.makernote;
					        			if ('Makernote' in exifData.exif) delete exifData.exif.Makernote;
					        			if ('MakerNote' in exifData.exif) delete exifData.exif.MakerNote;

					        			if ('GPSLatitudeRef' in exifData.gps) {
					        				exifData.gps.latlon = get_lat_lon(exifData.gps);

					        				//work 56.491891, 84.949515
					        				// 100 miters
					        				//if ( isInside(56.491891,84.949515,exifData.gps.latlon[0],exifData.gps.latlon[1],0.01)) {
					        				//	console.log('0.01');
					        				//};
					        			};



					        			exifData.sha1 = sha1(buf);
					        			//exifData.fullfileName = file.slice(PIC_INPUTFOLDER.length,filePath.length);

					        			//var filePath = file.split(path.sep);
					        			
					        			exifData.fileName = filePath[filePath.length-1];
					        			exifData.eventName = eventName;
					        			exifData.collectionName = collectionName;
					        			//var rootPictureFolder = filePath[filePath.length-4];
					        			//console.log(file.slice(PIC_INPUTFOLDER.length,file.length));

					        			//Pictures/Collection/Event/picture.jpg
					        			exifData.fullfileName = rootPictureFolder + file.slice(PIC_INPUTFOLDER.length,file.length);



					        			var fullthumbnaildirname = path.dirname(path.join(PIC_THUMBNAILSFOLDER, file.slice(PIC_INPUTFOLDER.length,file.length)));

					        			var rootThumbnaildirname = path.basename(PIC_THUMBNAILSFOLDER);
					        			var thumbnailfilename = path.basename(file, path.extname(file)) + THUMBNAIL_FILE_ADDON + path.extname(file);
					        			console.log('thumbnailfilename: ' + thumbnailfilename);
					        			var fullthumbnailfilename = path.join(fullthumbnaildirname, thumbnailfilename);

					        			exifData.fullthumbnailfilename = path.join(rootThumbnaildirname, exifData.collectionName, exifData.eventName, thumbnailfilename);

					        			mkdirp(fullthumbnaildirname, function (err) {
					        			    if (err) console.error(err)
					        			    else { // directory created of exists
					        			    	//console.error('pow');
					        			    	
					        			    	if(!fs.existsSync(fullthumbnailfilename)) {
					        			    		gm(file)
					        			    		.resize(1920)
					        			    		.autoOrient()
					        			    		.write(fullthumbnailfilename, function (err) {
					        			    		  if (!err) console.log(' hooray! ');
					        			    		});
						        			    };
					        			    }
					        			});

					        			//console.log(exifData); // Do something with your data!

					        			db.collection('pictures').insert(exifData, function(err, result) {
					        			    if (err) {
					        			        if (err.code == MONDO_UNIQUE_INDEX_VIOLATION) {
					        			        	//numCallBacks++;
					        			        	console.log('Duplicate: ' + file);
					        			            console.log('zko: index violation');
					        			        } 
					        			        else {
					        			            console.log(err);
					        			            throw err;
					        			          }
					        			    }
					        			    console.log('Saved ' + numCallBacks);
					        			    if (++numCallBacks >= files_filtered.length) {
					        			        console.log('zko: close db')
					        			        return db.close();
					        			    }
					        			});
					        		});
		    			  		}      

		    			    });
					//};
						//};

	    			} catch (error) {
	    			    console.log('Error: ' + error.message);
	    			}

	    });
	    	


	
	});

});




