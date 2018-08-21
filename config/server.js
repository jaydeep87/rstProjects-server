const ip = require('ip');

var mode = 'development';
var host;
//var mode = 'production';

if(mode === "development") {
    process.env.port = 8080;
    host = "127.0.0.1";
}
else if(mode === "production"){
    process.env.port = 3000;
    host = ip.address();
}

module.exports = {
    domain: "http://"+host,
    port: process.env.port,
    mode: mode,
    secret: 'rst06082018jaydeep',
    staticAuthToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9yJpZCI6IjViNjdkNzFmNzE5ZTg2MWIyNGI5ZmYyZSI',
    tokenExpiration: 600000, // expires in 24 hours
    serverBaseUrl : "http://"+ host + ":" + process.env.port,
    serverBaseURLForClient : "http://localhost:" + process.env.port
};