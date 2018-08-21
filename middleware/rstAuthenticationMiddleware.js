/**
 * Created by Jaydeep verma on 06/08/2018.
 */
var serverConfig = require('../config/server');
var rstTokenAuthentication = require('../services/authTokenService.js');
module.exports = function () {
  return function (req, res, next) {
    var currentDate = new Date();
// change the updated_at field to current date
    req.updatedAt = currentDate;
    // if created_at doesn't exist, add to that field
    if (!req.createdAt) req.createdAt = currentDate;

    var token;
    token = req.body.authToken;
    if(!token){
      token = req.param('authToken');
    }
    if(token == serverConfig.staticAuthToken){
      req.authToken = token;
      next();
    }
    else{
      rstTokenAuthentication.verifyToken(token, function (err, token) {
        if (err) return res.json({statusCode: 401, statusMessage: "Invalid Authentication, Please Login again."});
        req.authToken = token; // This is the decrypted token or the payload you provided
        next();
      });
    }
  }
};