'use strict';

var createHandler = require('github-webhook-handler');

var Projects = require('../models/projects');

module.exports = function(app, settings) {

	var route = '/git_hook';
	var handler = createHandler({'path': route, 'secret': settings.gitToken});

	app.post(route, function(req, res) {
		handler(req, res, function(err) {
			res.statusCode = 404;
			res.send('no such location', err);
		});
	});

	handler.on('repository', function(evt) {
		
		var projects = new Projects(settings);
		projects.getFromGithub(function(err, repos) {
			if(err) {
				console.log('error!!!');
			}
		});
	});

	handler.on('pull_request', function(evt) {
		var evtObj = !evt.payload ? evt : evt.payload;

		console.log('Pull Request Event!!!! ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
		console.log('ACTION ===', evtObj.action);
		console.log('WAS MERGED ===', evtObj.pull_request.merged);
		console.log('|||||');
	});
};