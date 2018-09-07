/**
 * Created by Jaydeep on 3/10/2018.
 */
var User = require('../models/user.js');
var Bgc = require('../models/bgc.js');
const bcrypt = require('bcrypt');
const serverConfig = require('../config/server');
var rstTokenAuthentication = require('../services/authTokenService.js');
const jwt = require('jsonwebtoken');
const uuidv1 = require('uuid');

module.exports = {
  /******************************************
   * functionName:signUp of users
   * input: {}
   * output: JSON
   * owner: Jaydeep verma
   * date:06/08/2018
   ********************************************/
  signUp: function (userDetails, callback) {
    try {
      User.find({ $or:[ {'email':userDetails.email}, {'mobile':userDetails.mobile}]}, function (err, data) {
        if(err) return callback({statusCode: 500, statusMessage: "Unexpected Error while finding user", error: err}, null);
        if(data.length){
          return callback({result:data, statusCode: 422, statusMessage: "User already Exists...!!!"}, null);
        }
        else
        {
          bcrypt.hash(userDetails.password, 10, function(err, hash) {
            if(err){
              callback(err, null);
            }
            else
            {
              console.log(hash);
              User.create({
                fName: userDetails.fName,
                mName: userDetails.mName,
                lName: userDetails.lName,
                mobile: userDetails.mobile,
                email: userDetails.email,
                gender: userDetails.gender ? userDetails.gender : 'male',
                accountCreatedBy: userDetails.createdBy ? userDetails.createdBy : 'admin',
                password: hash
              },function (err, add_user_data) {
                if (err) return callback(err, null);
                return callback(null, {result:add_user_data,statusCode: 200, statusMessage: "User record added successfully...!!!"});
              })
            }
          });
        }
      });
    }
    catch (err) {
      return callback(null, {statusCode: 500, statusMessage: "Unexpected Error while adding user", error: err});
    }
  },
  /******************************************
   * functionName:signin of users
   * input: {}
   * output: JSON
   * owner: Jaydeep verma
   * date:06/08/2018
   ********************************************/
  signIn: function (loginDetails, callback) {
    try {
      User.findOne({
        $and : [{
          $or:[ {'email':loginDetails.emailOrMobile}, {'mobile':loginDetails.emailOrMobile}]},
          {
            "isAdmin":loginDetails.isAdmin
          }
        ]}, function (err, data) {
        if (err) {
          console.log(err);
          return callback(err, null)
        }
        else {
          var responseData = {};
          if (!data) {
            responseData.statusCode = 404;
            responseData.statusMessage = "User doesn't exists";
            return callback(null, responseData);
          }
          else {
            console.log('login id:'+loginDetails.password+data.password);
            if(data.isActive){
              User.comparePassword(loginDetails.password, data.password, function (err, isMatch) {
                if (isMatch) {
                  var dataObj = {};
                  dataObj.mobile = data.mobile;
                  dataObj.email = data.email;
                  dataObj.fName = data.fName;
                  dataObj.mName = data.mName;
                  dataObj.lName = data.lName;
                  dataObj.profileImage = data.profileImage;
                  dataObj.userId = data._id;
                  dataObj.isAdmin = data.isAdmin;
                  responseData.data = dataObj;
                  responseData.authToken = rstTokenAuthentication.issueToken({ id: data._id }, serverConfig.secret, { expiresIn: serverConfig.tokenExpiration});
                  responseData.serverBaseURL = serverConfig.serverBaseUrl;
                  //console.log("Authtoken : "+responseData.authToken+"id : "+data.id);
                  responseData.statusCode = 200;
                  responseData.statusMessage = "User verified Successfully..!!!";
                  return callback(null, responseData);
                }
                else {
                  responseData.statusCode = 404;
                  responseData.statusMessage = "Password is not correct, please try again.";
                  return callback(null, responseData);
                }
              });
            }
            else
            {
              responseData.statusCode = 401;
              responseData.statusMessage = "Your account is deactivated, Please contact to Admin for Login.";
              return callback(null, responseData);
            }
          }
        }
      });
    }
    catch (err) {
      return callback(null, {statusCode: 500, statusMessage: "Unexpected Error while sign in user!!", error: err});
    }
  },

  /******************************************
   * functionName:uploadUserProfileImage
   * input:
   * output: JSON
   * owner:
   * date:13/08/2018
   ********************************************/
  uploadUserProfileImage: function (_id, imageDetails, callback) {
    try {
      console.log(_id);
      var thumbURL = imageDetails.destination.split('public')[1] + '/' + imageDetails.filename;
      console.log(thumbURL);
      Bgc.findOneAndUpdate({_id:_id}, {profileImage: thumbURL},function (err, updateUserDataObj) {
        if (err) return callback(err);
        else {
          console.log(updateUserDataObj);
          return callback(null, {statusCode:200,data:updateUserDataObj, serverBaseURL: serverConfig.serverBaseURLForClient, statusMessage:"Uploaded successfully"})
        }
      })
    }
    catch(err){
      callback(err, null);
    }
  },

  /******************************************
   * functionName:uploadEducationalDocuments
   * input:
   * output: JSON
   * owner:
   * date:13/08/2018
   ********************************************/
  uploadEducationalDocuments: function (clientData, imageDetails, callback) {
    try {
      console.log(clientData._id);
      var fileURL = imageDetails.destination.split('public')[1] + '/' + imageDetails.filename;
      var documentDataObj = {};
      documentDataObj.uuid = uuidv1();
      documentDataObj.fileURL = fileURL;
      documentDataObj.name = clientData.name;

      console.log(documentDataObj);
      var educationList = [];
      Bgc.findOne({_id: clientData._id},function (err, userDataObj) {
        if (err) return callback(err);
        if(userDataObj && userDataObj.educationQualificationDocumentList.length)
        {
          educationList = userDataObj.educationQualificationDocumentList;
          educationList.push(documentDataObj);
          Bgc.findOneAndUpdate({_id:clientData._id}, {educationQualificationDocumentList: educationList},function (err, updatedData) {
            if (err) return callback(err);
            else {
              console.log(updatedData);
              return callback(null, {statusCode:200, data:updatedData, serverBaseURL: serverConfig.serverBaseURLForClient, statusMessage:"Uploaded successfully"})
            }
          })
        }
        else
        {
          educationList = [];
          educationList.push(documentDataObj);
          Bgc.findOneAndUpdate({_id:clientData._id}, {educationQualificationDocumentList: educationList},function (err, updateUserDataObj) {
            if (err) return callback(err);
            else {
              console.log(updateUserDataObj);
              return callback(null, {statusCode:200, data:updateUserDataObj, serverBaseURL: serverConfig.serverBaseURLForClient, statusMessage:"Uploaded successfully"})
            }
          })
        }
        //if (cityObj) {
        //  if(cityObj.cityImage) fse.removeSync('./public/images/uploads/city/' + cityObj.cityImage);
        //}

      })
    }
    catch(err){
      callback(err, null);
    }
  }


};