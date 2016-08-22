'use strict';

var api = require('gh-api-stream');
var fs = require('fs');
var path = require('path');
var promise = require('bluebird');
var isEqual = require('lodash/isEqual');
var omitBy = require('lodash/omitBy');
var omit = require('lodash/omit');
var NpmInstall = require('./npmInstall');

module.exports = function(settings) {

	function parsePackageJson (str) {
		str = (new Buffer(str, 'base64')).toString();
		return JSON.parse(str);
	}

	this.getPackageJson = function(proj) {
		
		return new promise(function(resolve, reject) {
			var request = api('/repos/felipeorganization/' + proj + '/contents/package.json');
			request.on('data', function(data) {
				resolve(parsePackageJson(data.content));
			});

			request.on('error', function(err) {
				reject(err);
			});

		});
	};

	this.savePackageJson = function(proj) {
		return new promise(function(resolve, reject) {
			var projectPackage = path.join(settings.cachePath, proj.name, 'package.json');
			var filteredProject = removeLocalAndDevDependencies(proj);
			fs.writeFile(projectPackage, JSON.stringify(filteredProject), function(err) {
				if(err) {
					reject(err);
				} else {
					resolve('success');
				}				
			});
		});
	};

	function checkLocalPackage(projectPackage) {
		return new promise(function(resolve, reject) {
			if(fs.existsSync(projectPackage)) {
				fs.readFile(projectPackage, function(err, data) {
					if(err) {
						reject(err);
					} else {
						resolve(parsePackageJson(data));
					}
				});
			} else {
				resolve({});
			}
		});
	}

	function comparePackages(remotePackage, cachePackage) {
		if(remotePackage.dependencies && cachePackage.dependencies) {
			var dependenciesAreTheSame = isEqual(remotePackage.dependencies, cachePackage.dependencies);
			console.log('DEPENDENCIES ARE THE SAME!!', dependenciesAreTheSame);
			if(!dependenciesAreTheSame) {
				var npmInstall = new NpmInstall(settings);
				npmInstall.execInstall(remotePackage.name);
			}
		}
	}

	function removeLocalAndDevDependencies(pack) {
		var newpack = omit(pack, ['devDependencies', 'scripts']);

		newpack.dependencies = omitBy(newpack.dependencies, function(val) {
			return val.match(/(file\:)((\.\.?\/)+)?(\w+\/?)+((\.|\#)\w+)?/ig);
		});

		return newpack;
	}

	this.getProjectPackage = function(proj) {
		var self = this;
		var projectPackage = path.join(settings.cachePath, proj, 'package.json');
		var cachePackage = {};
		var remotePackage = {};

		self.getPackageJson(proj)
			.then(function(pack) {
				console.log('package.json fetched!!!');
				remotePackage = removeLocalAndDevDependencies(pack);
				return checkLocalPackage(projectPackage);
			})
			.then(function(pack) {
				console.log('local package checked!!');
				cachePackage = pack;
				return self.savePackageJson(remotePackage);
			})
			.then(function() {
				console.log('new package.json saved!!!!');
				comparePackages(remotePackage, cachePackage);
			}).catch(function(err) {
				console.log('error!!', err);
				return null;
			});
	};
};