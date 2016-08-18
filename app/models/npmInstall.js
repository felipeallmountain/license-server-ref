'use strict';

var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');

module.exports = function(settings) {

	this.execInstall = function(proj) {
		var projectFolder = path.join(settings.cachePath, proj);
		console.log('INSTALLING IN FOLDER: ', projectFolder);
		exec('npm install', {cwd: projectFolder, env: process.env}, function(error, stdout, stderr) {
			if(error) {
				console.error('NPM install error:', error);
				return;
			}

			if(stdout) {
				console.log('installed!!', stdout);
				saveDependenciesTree(stdout, projectFolder);
			}

			if(stderr) {
				console.log('stderr', stderr);
			}
		});
	};

	function saveDependenciesTree(tree, projectFolder) {
		console.log('SAVING TREE!!!');
		var dependencyPath = path.join(projectFolder, 'dependencies.json');
		var modulesFolder = path.join(projectFolder, 'node_modules');
		fs.writeFile(dependencyPath, tree, function() {
			rimraf(modulesFolder, function(err) {
				if(err) {
					console.log('error deleting', modulesFolder);
				} else {
					console.log('modules deleted!!');
				}
			});
			
		});
		
	}
};