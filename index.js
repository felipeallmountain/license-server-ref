var express = require('express');
var app = express();

var route = '/git_hook';

var createHandler = require('github-webhook-handler');
var handler = createHandler({'path': route, 'secret': 'githook'});

app.get('/', function(req, res) {
	res.send('wenasss');
});

app.post(route, function(req, res) {
	handler(req, res, function(err) {
		res.statusCode = 404;
		res.send('no such location');
	});
});

handler.on('repository', function(evt) {
	var evtObj = !evt.payload ? evt : evt.payload;

	console.log('create Event!!! ///////////////////////////////////////////////////////');
	
	console.log('ACTION ====', evtObj.action);
	console.log('repo ====', evtObj.repository.full_name);
	
	console.log('-');
});

handler.on('pull_request', function(evt) {
	var evtObj = !evt.payload ? evt : evt.payload;

	console.log('Pull Request Event!!!! ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
	console.log('ACTION ===', evtObj.action);
	console.log('MERGED ===', evtObj.pull_request.merged);
	console.log('|||||')
});

app.listen(3000, function() {
	console.log('Server in localhost:3000');
});

