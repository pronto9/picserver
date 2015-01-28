/*global jQuery */ 
"use strict";


var main = function () {

	var image_properties = {};
	var collectionIndex;
	var currentCollection;
	var current_image_name;

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
	

	$('body').on('click', 'button#show-map-button', function() {
		$('#fMap').removeClass('hidden');
		var latlon = get_lat_lon(image_properties[current_image_name].gps);

		$('#fMap').gmap3({
		 map:{
		    options:{
		     center: latlon,
		     zoom: 17
		    }
		 },
		 marker:{
		    latLng: latlon,
		    callback: function(){
		     $(this).css('border', '1px solid black');
		    }
		 }
		});
	});

	$('body').on('click', 'button#home-button', function() {
		//alert( $(this).text() );
		$('#fMap').gmap3('destroy'); //.remove();
		$( ".picture-directory" ).empty();
		$('#galleria').addClass('hidden');
		$('#view-area').addClass('hidden');
		drawCollectionIndexRoot();
	});

	$('body').on('click', 'a.picture-directory-collection', function() {
		//alert( $(this).text() );
		$( ".picture-directory" ).empty();
		drawEventsIndex( $(this).text() );
	});

	$('body').on('click', 'a.picture-directory-event', function() {
		//alert( $(this).text() );
		//$( ".picture-directory" ).empty();
		//drawEventsIndex( $(this).text() );
		var currentEventName = $(this).text();
		var url = 'getalbum/' + currentCollection + '/' + currentEventName;
		//alert(url);

		//$('#galleria').addClass('hidden');
		$('#galleria').removeClass('hidden');
		$('#view-area').removeClass('hidden');
		$('#show-map-button').removeClass('hidden');

		
		$.ajax({
			"url" : url,
			"type": "GET"
			}).done(function (responce) {
				if (responce.length > 0) {
					var imagedataSource = [];
					image_properties = {};
					//console.log(responce);
					responce.forEach(function(item) {
						//console.log(item.fullthumbnailfilename);
						imagedataSource.push({image : item.fullthumbnailfilename, description : String(item.fileName)});
						//image_properties[item.fullthumbnailfilename] = item.image;
						image_properties[item.fullthumbnailfilename] = item;
					});
					//console.log(image_properties);
					//console.log(imagedataSource);
					Galleria.configure({
					    thumbnails:'lazy',
					    transition: 'fade',
					    dataSource:imagedataSource
					});
					Galleria.run('#galleria');
				}
			}).fail(function (err) {
				console.log(err);
			});
	});

	var drawCollectionIndexRoot = function () {
		$( ".picture-directory" ).empty();
		collectionIndex.forEach(function(item) {
			var $new_IndexRoot = $("<p>").append($('<a class="picture-directory-collection">').text(item._id));
			$(".picture-directory").append($new_IndexRoot);
		});
	};

	var drawEventsIndex = function (collectionName) {
		collectionIndex.forEach(function(item) {
			if ( item._id === collectionName ) {
				currentCollection = collectionName;
				item.events.forEach(function(eventName) {
					//console.log(eventName);
					var $new_collectionIndex = $("<p>").append($('<a class="picture-directory-event">').text(eventName.eventName));
					$(".picture-directory").append($new_collectionIndex);
				});
			};
		});
	};

	


	// Get picture directory
	$.ajax({
		"url" : "getCollectionIndex",
		"type": "GET"
		}).done(function (responce) {
			if (responce.length > 0) {
				collectionIndex = responce;
				drawCollectionIndexRoot();
				//console.log(responce);
			}
		}).fail(function (err) {
			console.log(err);
		});



	Galleria.loadTheme('lib/galleria/themes/classic/galleria.classic.min.js');


	Galleria.ready(function(options) {



		var gallery = this; // galleria is ready and the gallery is assigned

		gallery.attachKeyboard({
		    left: gallery.prev, // applies the native prev() function
		    right: gallery.next,
		    32: function() {
		        // start playing when return (keyCode 13) is pressed:
		        gallery.playToggle(3000);
		    }
		});




		$('#fs').on('click',function (event) {
			gallery.toggleFullscreen(); // toggles the fullscreen
			//gallery.openLightbox();
		});



		this.bind('image', function(e) {
		        //Galleria.log('Now viewing ' + e.imageTarget.src);

		        var image_src = $(e.imageTarget).context.src;
		        var image_filename = image_src.split('/');
		        var image_name = image_filename[image_filename.length-1];

		        if (current_image_name != image_name) {
		        	$('#fMap').gmap3('destroy');//.remove();
		        	$('#fMap').addClass('hidden');
		        };
		        current_image_name = image_name;

		        $("#exif-Make").text('Make: ' + image_properties[image_name].image.Make);
		        $("#exif-Model").text('Model: ' + image_properties[image_name].image.Model);

		        if ('geo' in image_properties[image_name]) {
		        	$("#exif-geo-yandex-city").text(image_properties[image_name].geo.yandex_city);
		        	$("#exif-geo-yandex-address").text(image_properties[image_name].geo.yandex_address);
		        	$("#exif-geo-computed-address").text(image_properties[image_name].geo.computed_address);
		        };


		        // Check if GPS properties are set
		        if ('GPSLatitudeRef' in image_properties[image_name].gps) {
		        	$("button#show-map-button").removeAttr('disabled');
		        } else {
		        	$("button#show-map-button").attr('disabled','disabled');
		        };

		    });


		this.bind("loadfinish", function(e) {
			
			var image_src = $(e.imageTarget).context.src;
			var image_filename = image_src.split('/');
			var image_name = image_filename[image_filename.length-1];


			//console.log(image_properties[image_name].Orientation);

			//console.log('rotator:  '+ image_name);

			/* turn off auto rotation

			if (image_properties[image_name] === 6 ) {
				$(e.imageTarget).rotate(90);
			} else if (image_properties[image_name] ===  8) {
				$(e.imageTarget).rotate(270);
			} else if (image_properties[image_name] ===  3) {
				$(e.imageTarget).rotate(180);
			};
 		    */

		});

		this.lazyLoadChunks(6);
	});


	Galleria.run('#galleria');

};



$(document).ready(main);
