'use strict';

var fs = require('fs');
var path = require('path');
var api = require('gh-api-stream');

module.exports = function(settings) {
	var projRepos;
	var cachedFile = path.join(settings.cachePath, 'repos.json');


	this.isCached = function() {
		return fs.existsSync(cachedFile);
	};

	this.getFromCache = function(response) {
		response.sendFile(cachedFile);
	};

	this.saveToCache = function() {
		fs.writeFile(cachedFile, JSON.stringify(projRepos), function(dat){
			if(dat) {
				console.log(dat);
			} else {
				console.log('Saved on cache!!!');
			}
		});
	};

	this.getFromGithub = function(callback) {
		var self = this;
		var request = api('/orgs/felipeorganization/repos');

		request.on('data', function(response) {
			var projs = response.map(function(repo) {
				return repo.name;
			});

			projRepos = projs;
		});

		request.on('end', function() {
			callback(null, projRepos);
		});

		request.on('error', function(err){
			callback(err, null);
		});
	};

};