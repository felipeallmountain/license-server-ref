'use strict';

var exec = require('child_process').exec;
var path = require('path');

module.exports = function(settings) {

	this.execInstall = function(proj) {
		var projectFolder = path.join(settings.cachePath, proj);
		exec('npm install', {cwd: projectFolder}, function(error, stdout, stderr) {
			if(error) {
				console.error('NPM install error:', error);
				return;
			}
			console.log('stdout', stdout);
			console.log('stderr', stderr);
		});
	};

};