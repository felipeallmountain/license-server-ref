'use strict';

var fs = require('fs');
var path = require('path');
var api = require('gh-api-stream');
var diff = require('lodash/difference');
var pull = require('lodash/pull');
var rimraf = require('rimraf');
var promise = require('bluebird');

var PackageJson = require('./packageJson.js');

module.exports = function(settings) {
	var projRepos;
	var cachedFile = path.join(settings.cachePath, 'repos.json');

	var packageJson = new PackageJson(settings);


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
			projRepos = response.map(function(repo) {
				return repo.name;
			});
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

			modifyList(exclusionFolders, removeFolder)
				.then(function() {
					return modifyList(projRepos, createFolder);
				})
				.then(function(createdFolders) {
					return modifyList(createdFolders, packageJson.getPackageJson);
				})
				.then(function(packageName) {
					return modifyList(pull(packageName, null), packageJson.savePackageJson);
				});
		});
	}

	function modifyList(list, method) {
		return promise.map(list, function(proj) {
			return method(proj)
				.catch(function() {
					return null;
				});
		});
	}

	function removeFolder(proj) {
		var projectFolder = path.join(settings.cachePath, proj);

		return new promise(function(resolve, reject) {
			rimraf(projectFolder, function(err) {
				if(err) {
					reject(err);
				} else {
					resolve(proj);
				}
			});
		});
	}

	function createFolder(proj) {
		var projectFolder = path.join(settings.cachePath, proj);

		return new promise(function(resolve, reject) {
			if(!fs.existsSync(projectFolder)) {
				fs.mkdir(projectFolder, function(err) {
					if(err) {
						reject(err);
					} else {
						resolve(proj);
					}
				});
			}
		});
	}
};