var ExifImage = require('exif').ExifImage;
var dir = require('node-dir');
var sha1 = require('sha1');
var Buffer = require('buffer').Buffer;
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;


// db.pictures.ensureIndex({sha1:1},{unique:1});


var PIC_INPUTFOLDER = '/home/zko/picserver/client/Pictures';
var MONDO_UNIQUE_INDEX_VIOLATION = 11000;

MongoClient.connect('mongodb://localhost:27017/users', function(err, db) {
	var numCallBacks = 0;

	dir.paths(PIC_INPUTFOLDER, function(err, paths) {
	    if (err) throw err;
	    //console.log('files:\n',paths.files);

	    paths.files.forEach(function(file) {
	    			try {
	    			    new ExifImage({ image : file }, function (error, exifData) {
	    			        if (error)
	    			            console.log('Error: '+error.message);
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
				        			exifData.sha1 = sha1(buf);
				        			//exifData.fullfileName = file.slice(PIC_INPUTFOLDER.length,filePath.length);

				        			var filePath = file.split('/');
				        			var rootPictureFolder;
				        			exifData.fileName = filePath[filePath.length-1];
				        			exifData.eventName = filePath[filePath.length-2];
				        			exifData.collectionName = filePath[filePath.length-3];
				        			var rootPictureFolder = filePath[filePath.length-4];

				        			exifData.fullfileName = rootPictureFolder + file.slice(PIC_INPUTFOLDER.length,file.length);

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
				        			    if (++numCallBacks >= paths.files.length) {
				        			        console.log('zko: close db')
				        			        return db.close();
				        			    }
				        			});
				        		});
	    			        }
	    			    });
	    			} catch (error) {
	    			    console.log('Error: ' + error.message);
	    			}

	    	    });
	});

});




/*

try {
    new ExifImage({ image : 'Photo18.jpg' }, function (error, exifData) {
        if (error)
            console.log('Error: '+error.message);
        else
            console.log(exifData); // Do something with your data!
    });
} catch (error) {
    console.log('Error: ' + error.message);
}

*/