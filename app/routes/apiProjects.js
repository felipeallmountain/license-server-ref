'use strict';

var Projects = require('../models/projects');

module.exports = function(app, settings) {
	app.get('/api/projects', function(req, res) {
		var projects = new Projects(settings);

		if(projects.isCached()) {
			projects.getFromCache(res);
		} else {
			projects.getFromGithub(function(err, repos) {
				res.json(repos);
			});
		}
	});
};