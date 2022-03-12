var express = require("express");
 
var app = express();

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("./public"));

var home_router = require('./routes/home.js');
app.use('/', home_router);

app.listen(3000, function(){
	console.log("Servidor ON");
});
