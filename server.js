var http = require('http');
var fs = require('fs');
var url = require('url');

var server = http.createServer(function(request, response) {
	var pathname = url.parse(request.url).pathname;
	console.log("pathname = " + pathname);
	fs.readFile('gui.html', function(err, contents) {
		response.writeHead(200);
		response.write(contents);
		response.end();
	});
	
}).listen(8080);
