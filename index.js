var express = require('express');
var app = express();

app.get('/', function(req, res) {
	res.send('wenasss');
});

app.listen(3000, function() {
	console.log('Server in localhost:3000');
});