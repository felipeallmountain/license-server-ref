'use strict';

var express = require('express');
var Settings = require('./app/models/settings');


module.exports = function(initialConfig) {
	var app = express();

	var settings = new Settings();

	require('./app/routes/ghHook')(app, settings);
	require('./app/routes/apiProjects')(app, settings);

	app.listen(3000, function() {
		console.log('Server in localhost:3000');
	});
};

