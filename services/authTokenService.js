/**
 * Created by Lenovo on 06-08-2018.
 */
var jwt = require('jsonwebtoken');
var serverConfig = require('../config/server');
module.exports = {

    /******************************************
     * functionName:issueToken
     * input:payload json
     * output: token
     * owner:Jaydeep Verma
     * date:06/08/2018

     ********************************************/

    issueToken: function (payload) {
        var token = jwt.sign(
            payload,
            serverConfig.secret,  { expiresIn: serverConfig.tokenExpiration });
        return token;
    },

    /******************************************
     * functionName:verifyToken
     * input:token,verified
     * output: token
     * owner:jaydeep verma
     * date:06/08/2018

     ********************************************/
    verifyToken: function (token, callback) {
        return jwt.verify(
            token, // The token to be verified
            serverConfig.secret, // Same token we used to sign
            {}, // No Option, for more see https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
            callback //Pass errors or decoded token to callback
        );
    }
};