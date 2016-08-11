'use strict';

var path = require('path');

module.exports = function(initial) {
	initial = initial || {};

	this.gitToken = initial.gitToken || process.env.GH_TOKEN;
	this.cachePath = initial.cachePath || path.join(process.cwd(), 'cache');
	this.serverPort = initial.serverPort || process.env.PORT || 3000;
};