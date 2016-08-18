'use strict';

var createHandler = require('github-webhook-handler');

var Projects = require('../models/projects');
var PackageJson = require('../models/packageJson');

module.exports = function(app, settings) {

	var route = '/git_hook';
	var handler = createHandler({'path': route, 'secret': settings.gitToken});
	var projects = new Projects(settings);
	var packageJson = new PackageJson(settings);

	app.post(route, function(req, res) {
		handler(req, res, function(err) {
			res.statusCode = 404;
			res.send('no such location', err);
		});
	});

	handler.on('repository', function() {
		projects.getFromGithub(function(err, repos) {
			if(err) {
				console.log('error!!!');
			} else {
				console.log('repos!!', repos);
			}
		});
	});

	handler.on('pull_request', function(evt) {
		var evtObj = !evt.payload ? evt : evt.payload;

		if(evtObj.action === 'closed' && evtObj.pull_request.merged === true) {
			packageJson.getProjectPackage(evtObj.repository.name);
		}

	});
};