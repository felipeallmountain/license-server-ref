'use strict';

var throng = require('throng');
var index = require('./index');

throng( 
	{
		workers: 1,
		lifetime: Infinity,
		start: function() {
			index();
		}
	}
);