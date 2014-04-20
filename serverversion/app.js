var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var child_process = require('child_process');

app.use(bodyParser());


// get all resources
app.get('/resources/*', function(req, res) {
	res.sendfile('public/resources/' + req.params[0]);
});

app.get('/bootstrap/*', function(req, res) {
	res.sendfile('public/bootstrap/' + req.params[0]);
});


// get all pages
app.get('/', function(req, res) {
	res.sendfile('public/index.html');
});
app.get('/Archive.html', function(req, res) {
	res.sendfile('public/Archive.html');
});
app.get('/ImageExtrude.html', function(req, res) {
	res.sendfile('public/ImageExtrude.html');
});
app.get('/Voronoi.html', function(req, res) {
	res.sendfile('public/Voronoi.html');
});
app.get('/testVoro.html', function(req, res) {
	res.sendfile('public/testVoro.html');
});

app.post('/data', function(req, res) {
	res.writeHead(200, {'Content-Type':'text/plain'});
	child_process.execFile('./test', function(error, stdout, stderror){
		res.write(stdout);
		res.end();	
	});	
});
app.listen(8000);
