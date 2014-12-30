var main = function () {
	"use strict";


	Galleria.loadTheme('galleria/themes/classic/galleria.classic.min.js');

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
		this.lazyLoadChunks(3);
	});


	Galleria.run('.galleria');

}



$(document).ready(main);
