'use strict';

var express = require('express');


module.exports = function(initialConfig) {
	var app = express();

	var settings = {};


	require('./app/routes/ghHook')(app, settings);

	app.listen(3000, function() {
		console.log('Server in localhost:3000');
	});
};

