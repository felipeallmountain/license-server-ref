'use strict';

var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');

module.exports = function(settings) {

	this.execInstall = function(proj) {
		var projectFolder = path.join(settings.cachePath, proj);
		console.log('EXECUTING NPM INSTALL');
		exec('npm install', {cwd: projectFolder, env: process.env}, function(error, stdout, stderr) {
			if(error) {
				console.error('NPM install error:', error);
				deleteModulesFolder(projectFolder);
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

	function deleteModulesFolder(projectFolder) {
		var modulesFolder = path.join(projectFolder, 'node_modules');
		rimraf(modulesFolder, function(err) {
			if(err) {
				console.error('error deleting', modulesFolder);
			} else {
				console.log('node_modules successfully deleted!!!');
			}
		});
	}

	function saveDependenciesTree(tree, projectFolder) {
		var dependencyPath = path.join(projectFolder, 'dependencies.json');
		fs.writeFile(dependencyPath, tree, function() {
			deleteModulesFolder(projectFolder);			
		});
		
	}
};