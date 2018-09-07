const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dbConfig = require('./config/database.js');
const mongoose = require('mongoose');
const indexRoutes = require('./routes/indexRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const serverConfig = require('./config/server.js');
const bluebird = require('bluebird');
const cookieParser = require('cookie-parser');
//const session = require('express-session');

//Database Connection
var options = {
    //server: {socketOptions: {keepAlive: 300000, connectTimeoutMS: 30000}},
    //replset: {socketOptions: {keepAlive: 300000, connectTimeoutMS: 30000}},
    //useMongoClient: true
};
//var Schema = mongoose.Schema; // AFTER THIS LINE
mongoose.Promise = bluebird;
//bluebird.promisifyAll(mongoose); //AND THIS LINE
mongoose.connect(dbConfig.database, options);
mongoose.connection.on('connected', function () {
    console.log("DB connected at: " + dbConfig.database);
});
mongoose.connection.on('disconnected', function () {
    console.log("DB disconnected at: " + dbConfig.database);
});
mongoose.connection.on('error', function (err) {
    console.log("DB Error: " + err);
});
// Load express app
const app = express();
//set middleware


var corsOptions = {
    origin: 'http://localhost',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(express.static('public'));   // set the static files location


//mounting other routes
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/', indexRoutes);
app.use('/rst/api-v1/user', userRoutes);
//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
    res.status(404).send('<html><head><title>Page Not found</title></head><body style="padding: 50px; font-size: 30px; background-color: lightgray"><h3 style="padding: 15px; background-color: #00627e; color: red"> 404 Page Not found...!!!</h3></body> </html>');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    //res.sendFile('../public/notFound404.html', {root: __dirname});
    res.status(404).send('<html><head><title>404 Page Not found</title></head><body style="padding: 50px; font-size: 30px; background-color: lightgray"><h3 style="padding: 15px; background-color: #00627e; color: red"> 404 Page Not found...!!!</h3></body> </html>');
});


//local server or network hosted server

if (serverConfig.mode === "l") {
    app.listen(serverConfig.port, function () {
        console.log("RST Panel Server is Running....!!! at >> " + serverConfig.domain + ":" + serverConfig.port);
    });
}
else {
    app.listen(serverConfig.port, '0.0.0.0', function () {
        console.log("RST Panel Server is Running....!!! at >> " + serverConfig.domain + ":" + serverConfig.port);
    });
}
