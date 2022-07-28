var express = require("express");
var bodyParser = require('body-parser')
 
var app = express();

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("./public"));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json())

var home_router = require('./routes/home.js');
app.use('/', home_router);

app.listen(3000, function(){
	console.log("Server ON");
});
