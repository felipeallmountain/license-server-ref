'use strict';

var fs = require('fs');
var path = require('path');
var api = require('gh-api-stream');

module.exports = function() {
	var projRepos;
	var cachedFile = './cache/repos.json';


	this.isCached = function() {
		return fs.existsSync(cachedFile);
	};

	this.getFromCache = function(callback) {
		callback.sendFile(cachedFile);
	};

	this.saveToCache = function() {
		fs.writeFile(cachedFile, JSON.stringify(projRepos), function(dat){
			console.log('Saved on cache:', dat === null);
		});
	};

	this.getFromGithub = function(callback) {
		var request = api('/orgs/felipeorganization/repos');

		request.on('data', function(response) {
			projRepos = response.map(function(repo) {
				return repo.name;
			});
		});

		request.on('end', function() {
			callback(null, projRepos);
		});

		request.on('error', function(err){
			callback(err, null);
		});
	};

};