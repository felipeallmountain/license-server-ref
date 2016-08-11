'use strict';

var fs = require('fs');
var path = require('path');
var api = require('gh-api-stream');
var diff = require('lodash/difference');
var pull = require('lodash/pull');
var rimraf = require('rimraf');

module.exports = function(settings) {
	var projRepos;
	var cachedFile = path.join(settings.cachePath, 'repos.json');


	this.isCached = function() {
		return fs.existsSync(cachedFile);
	};

	this.getFromCache = function(response) {
		response.sendFile(cachedFile);
	};

	function saveToCache () {
		fs.writeFile(cachedFile, JSON.stringify(projRepos), function(dat){
			if(dat) {
				console.log(dat);
			}
		});
	}

	this.getFromGithub = function(callback) {
		var request = api('/orgs/felipeorganization/repos');

		request.on('data', function(response) {
			var projs = response.map(function(repo) {
				return repo.name;
			});

			projRepos = projs;
		});

		request.on('end', function() {
			saveToCache();
			checkStoredProjects();
			callback(null, projRepos);
		});

		request.on('error', function(err){
			callback(err, null);
		});
	};

	function checkStoredProjects() {
		var cachedFolders = [];
		var exclusionFolders = [];
		fs.readdir(settings.cachePath, function(err,files) {

			cachedFolders = !err ? files : [];
			exclusionFolders = pull(diff(cachedFolders, projRepos), 'repos.json');

			modifyProjectDirectories(exclusionFolders, false);
			modifyProjectDirectories(projRepos, true);
		});
	}

	function modifyProjectDirectories(list, create) {
		list.forEach(function(proj) {
			var projFolder = path.join(settings.cachePath, proj);
			if(create) {
				if(!fs.existsSync(projFolder)) {
					fs.mkdir(projFolder, function(err) {
						if(err) {
							console.log('Error Creating Folder', err);
						}
					});
				}
			} else {
				rimraf(projFolder, function(err) {
					if(err) {
						console.log('Error Removing Folder', err);
					}
				});

			}
		});
	}
};