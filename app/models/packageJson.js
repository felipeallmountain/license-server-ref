'use strict';

var api = require('gh-api-stream');
var fs = require('fs');
var path = require('path');
var promise = require('bluebird');
var isEqual = require('lodash/isEqual');
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
		return new promise(function(resolve) {
			var projectPackage = path.join(settings.cachePath, proj.name, 'package.json');
			fs.writeFile(projectPackage, JSON.stringify(proj), function() {
				resolve('success');
			});
		});
	};

	function checkLocalPackage(pack) {
		return new promise(function(resolve, reject) {
			if(fs.existsSync(pack)) {
				fs.readFile(pack, function(err, data) {
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
		var dependenciesAreTheSame = isEqual(remotePackage.dependencies, cachePackage.dependencies);
		if(!dependenciesAreTheSame) {
			var npmInstall = new NpmInstall(settings);
			npmInstall.execInstall(remotePackage.name);
		}
	}

	this.getProjectPackage = function(proj) {
		var self = this;
		var projectPackage = path.join(settings.cachePath, proj, 'package.json');
		var cachePackage = {};
		var remotePackage = {};

		self.getPackageJson(proj)
			.then(function(pack) {
				remotePackage = pack;
				return checkLocalPackage(projectPackage);
			})
			.then(function(pack) {
				cachePackage = pack;
				return self.savePackageJson(remotePackage);
			})
			.then(function() {
				comparePackages(remotePackage, cachePackage);
			}).catch(function(err) {
				console.log('error!!', err);
				return null;
			});
	};
};