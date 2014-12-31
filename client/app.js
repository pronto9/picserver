var main = function () {
	"use strict";

	var orientation_map = {};
	var collectionIndex;
	var currentCollection;

	

	$('body').on('click', 'button#home-button', function() {
		//alert( $(this).text() );
		$( ".picture-directory" ).empty();
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

		$.ajax({
			"url" : url,
			"type": "GET"
			}).done(function (responce) {
				if (responce.length > 0) {
					var imagedataSource = [];
					orientation_map = {};
					//console.log(responce);
					responce.forEach(function(item) {
						//console.log(item.fullfileName);
						imagedataSource.push({image : item.fullfileName, description : String(item.fileName)});
						orientation_map[item.fullfileName] = item.image.Orientation;
					});
					//console.log(orientation_map);
					//console.log(imagedataSource);
					Galleria.configure({
					    thumbnails:'lazy',
					    transition: 'fade',
					    dataSource:imagedataSource
					});
					Galleria.run('.galleria');
				}
			}).fail(function (err) {
				console.log(err);
			});
	});

	var drawCollectionIndexRoot = function () {
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
				console.log(responce);
			}
		}).fail(function (err) {
			console.log(err);
		});





	$(".picture-directory-alt a").on('click',function (event) {
		event.preventDefault();
		//alert(event.target.id);

		var url = 'getalbum/' + 2014 + '/' + event.target.id;
		//alert(url);

		$.ajax({
			"url" : url,
			"type": "GET"
			}).done(function (responce) {
				if (responce.length > 0) {
					var imagedataSource = [];
					orientation_map = {};
					//console.log(responce);
					responce.forEach(function(item) {
						//console.log(item.fullfileName);
						imagedataSource.push({image : item.fullfileName, description : String(item.fileName)});
						orientation_map[item.fullfileName] = item.image.Orientation;
					});
					//console.log(orientation_map);
					//console.log(imagedataSource);
					Galleria.configure({
					    thumbnails:'lazy',
					    transition: 'fade',
					    dataSource:imagedataSource
					});
					Galleria.run('.galleria');
				}
			}).fail(function (err) {
				console.log(err);
			});

	});




	Galleria.loadTheme('lib/galleria/themes/classic/galleria.classic.min.js');

	$.ajax({
		"url" : "gettestJSON",
		"type": "GET"
		}).done(function (responce) {
			if (responce.length > 0) {
				Galleria.configure({
				    thumbnails:'lazy',
				    dataSource:responce
				});
			}
		}).fail(function (err) {
			console.log(err);
		});

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

		$('#rotate-left-button').on('click',function (event) {
			$.ajax({
				"url" : "getCollectionIndex",
				"type": "GET"
				}).done(function (responce) {
					if (responce.length > 0) {
						console.log(responce);
					}
				}).fail(function (err) {
					console.log(err);
				});
		});



		this.bind("loadfinish", function(e) {
			
			var image_src = $(e.imageTarget).context.src;
			var image_filename = image_src.split('/');
			var image_name = image_filename[image_filename.length-1];

			//console.log('rotator:  '+ image_name);

			if (orientation_map[image_name] === 6 ) {
				$(e.imageTarget).rotate(90);
			} else if (orientation_map[image_name] ===  8) {
				$(e.imageTarget).rotate(270);
			} else if (orientation_map[image_name] ===  3) {
				$(e.imageTarget).rotate(180);
			};

		});

		this.lazyLoadChunks(3);
	});


	Galleria.run('.galleria');

}



$(document).ready(main);
