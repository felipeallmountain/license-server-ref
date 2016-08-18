'use strict';

var express = require('express');
var Settings = require('./app/models/settings');


module.exports = function(initialConfig) {
	var app = express();

	var settings = new Settings();

	app.get('/', function(req, res, err) {
		res.json('LICENSE SERVER!!');
	});

	require('./app/routes/ghHook')(app, settings);
	require('./app/routes/apiProjects')(app, settings);

	app.listen(settings.serverPort, function() {
		console.log('---> Server running in:', settings.serverPort);
	});
};

