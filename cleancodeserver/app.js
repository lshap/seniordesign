var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var app = express();
var child_process = require('child_process');
var fs = require('fs');

app.use(bodyParser());

// set up cross origin headers
app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });

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


app.post('/data/rectangular', function(req, res) {
	var jsondata = req.body["data"];
	fs.writeFile("particles_from_server",jsondata, 
			function(err) {
			if (err) {
				console.log(err);
				res.end();
			}
			else {
				res.writeHead(200, {'Content-Type':'text/plain'});
				child_process.execFile('./test', function(error, stdout, stderror){
					res.write(stdout);
					res.end();	
				});
			}

	});
});

app.post('/data/irregular', function(req, res) {
	var jsondata = req.body["data"];
	fs.writeFile("particles_from_server",jsondata, 
			function(err) {
			if (err) {
				console.log(err);
				res.end();
			}
			else {
				res.writeHead(200, {'Content-Type':'text/plain'});
				child_process.execFile('./irregular', function(error, stdout, stderror){
					res.write(stdout);
					res.end();	
				});
			}

	});
});
app.listen(8000);
