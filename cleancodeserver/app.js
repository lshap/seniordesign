var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var child_process = require('child_process');
var fs = require('fs');

app.use(bodyParser());


// get all resources
app.get('/siteimages/*', function(req, res) {
	res.sendfile('public/siteimages/' + req.params[0]);
});

app.get('/styles/*', function(req, res) {
	res.sendfile('public/styles/' + req.params[0]);
});

app.get('/src/*', function(req, res) {
	res.sendfile('public/src/' + req.params[0]);
});

app.get('/examples/*', function(req, res) {
	res.sendfile('public/examples/' + req.params[0]);
});

app.get('/bootstrap/*', function(req, res) {
	res.sendfile('public/bootstrap/' + req.params[0]);
});


// get all pages
app.get('/*', function(req, res) {
	res.sendfile('public/' + req.params[0]);
});
app.get('/', function(req, res) {
	res.sendfile('public/index.html');
});

app.post('/data', function(req, res) {
	var jsondata = req.body["data"];
	console.log(req.body);
	fs.writeFile("particles_from_server",jsondata, 
			function(err) {
			if (err) {
				console.log(err);
				res.end();
			}
			else {
				res.writeHead(200, {'Content-Type':'text/plain'});
				child_process.execFile('./irregular', function(error, stdout, stderror){
					console.log(stdout);
					res.write(stdout);
					res.end();	

				});
			}

	});
});
app.listen(8000);
