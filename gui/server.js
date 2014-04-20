var express = require('express'),
app = express();
console.log(__dirname);
app.use(express.static(__dirname + '/');
app.listen(8080);
