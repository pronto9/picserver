var main = function () {
	"use strict";

	var orientation_map = {};


	$(".picture-directory a").on('click',function (event) {
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
			//console.log($(gallery));
			//$(gallery.imageTarget).rotate(-90);
			//console.log(gallery.getActiveImage());
			//$(gallery.getActiveImage()).rotate(30);
			//gallery.addElement( $(gallery.getActiveImage()).rotate(30) );
			//gallery.splice( 0, 1 );

			//gallery.toggleFullscreen(); // toggles the fullscreen
			//gallery.openLightbox();
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

			//$(e.imageTarget).parent().zoom({'on' : 'grab'}).rotate(90);

			//console.log($(e.imageTarget).context.src);
			//console.log($(e.imageTarget));
			//console.log(e.imageTarget);
			//console.log(e);
		});

		this.lazyLoadChunks(3);
	});


	Galleria.run('.galleria');

}



$(document).ready(main);
