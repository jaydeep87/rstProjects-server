/**
 * Created by Jaydeep on 02/08/2018.
 */
var express = require('express');
var userController = require('../controllers/userController.js');
var serverConfig = require('../config/server');
var User = require('../models/user.js');
var Bgc = require('../models/bgc.js');
//var City = require('../models/city.js');
//var Location = require('../models/location.js');
//var Contact = require('../models/contact.js');
//var Group = require('../models/group.js');
const jsonSchema = require('../config/schema.js');
const policySchema = require('../config/policySchema.js');
var JSONValidatorService = require('../services/jsonValidatorService.js');
var async = require('async');
var RSTAuthenticationService = require('../middleware/rstAuthenticationMiddleware.js');
var multer = require('multer');
const uuidv1 = require('uuid');
const fse = require('fs-extra');
var fs = require('fs');
var csv = require("fast-csv");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(file.fieldname);
    const dir = './public/images/uploads/' + file.fieldname;
    fse.ensureDirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    console.log(file);
    cb(null, uuidv1()+file.originalname);
  }
});
var upload = multer({storage: storage});

//var upload = multer({ dest: 'uploads/' });
const routes = express.Router();


routes.post('/sign-up', function (req, res) {
  try {
    var clientData = {};
    clientData = req.body;
    clientData.createdAt = req.createdAt;
    clientData.updatedAt = req.updatedAt;
    console.log(clientData.isAuthorise);
    JSONValidatorService.jsonValidationWithSchema(req, res, jsonSchema.emp_user.empSignUp, clientData, function (err, data) {
      if (data) {
        if(clientData.password === clientData.confirmPassword){
          userController.signUp(clientData, function (err, data) {
            if (err) {
              res.json({
                statusCode: err.statusCode,
                statusMessage: err.statusMessage,
                error: err.error
              });
            }
            else {
              console.log(data);
              res.json({
                statusCode: 200,
                statusMessage: "User record added successfully...!!!",
                data: data.result
              });
            }
          });
        }
        else
        {
          res.json({
            statusCode: 400,
            statusMessage: "Password and confirm password mismatch...!!!"
          });
        }
      }
      else {
        res.json(err);
      }
    });
  }
  catch (err) {
    res.send({status: false, message: "Expected Parameters not found", error: err});
  }
});
routes.post('/login', function (req, res) {
  try {
    var clientData = req.body;
    console.log("client data : ", clientData);
    JSONValidatorService.jsonValidationWithSchema(req, res, jsonSchema.emp_user.empSignIn, clientData, function (err, data) {
      if (data) {
        userController.signIn(clientData, function (err, data) {
          if (err) {
            res.json({
              statusCode: 400,
              statusMessage: "Validation Error"
            });
          }
          else {
            res.json(data);
          }
        });
      }
      else {
        res.json({err: err});
      }
    });
  }
  catch (err) {
    res.send({status: false, message: "Expected Parameters not found", error: err});
  }
});
routes.post('/upload-user-profile-image/:authToken/:_id', upload.single('profile_image'), function(req, res){
  try{
    var clientData = {};
    console.log(req.params._id);
    clientData._id = req.params._id;
    if (!req.file) {
      console.log("No file received");
      return res.json({statusCode:404, statusMessage: "File not received"});
    }
    else
    {
      userController.uploadUserProfileImage(clientData._id, req.file, function (err, data) {
        if (err){
          return res.json({statusCode:500, statusMessage:"Cannot save image", error: err});
        }
        else{
          console.log(data);
          return res.json(data);
        }
      });
    }

  }
  catch(err){
    return res.json({statusCode:500, statusMessage:"Cannot save image", error: err});
  }

});
routes.post('/upload-user-education-document', upload.single('educational_document'), function(req, res){
  try{
    var clientData = req.body;
    console.log(clientData._id);
    if (!req.file) {
      console.log("No file received");
      return res.json({statusCode:404, statusMessage: "File not received"});
    }
    else
    {
      userController.uploadEducationalDocuments(clientData, req.file, function (err, data) {
        if (err){
          return res.json({statusCode:500, statusMessage:"Cannot save image", error: err});
        }
        else{
          console.log(data);
          return res.json(data);
        }
      });
    }

  }
  catch(err){
    return res.json({statusCode:500, statusMessage:"Cannot save image", error: err});
  }

});
routes.use(RSTAuthenticationService());
routes.post('/active-users-list', function(req, res){
  try{
    User.find({isActive : true }, function(err, user_list){
      if(err) return res.json(err);
      else return res.json({data:user_list,serverBaseURL: serverConfig.serverBaseUrl, statusCode:200, statusMessage:'OK'})
    })
  }
  catch(err)
  {
    res.json(err);
  }
});
routes.post('/in-active-users-list', function(req, res){
  try{
    User.find({isActive : false }, function(err, user_list){
      if(err) return res.json(err);
      else return res.json({data:user_list,serverBaseURL: serverConfig.serverBaseUrl, statusCode:200, statusMessage:'OK'})
    })
  }
  catch(err)
  {
    res.json(err);
  }
});
routes.post('/deactivate-user', function(req, res){
  try{
    var clientData = req.body;
    console.log("client data : ", clientData);
    User.findOneAndUpdate({_id:clientData.id},{isActive:false}, function(err, user){
      if(err) return res.json(err);
      else return res.json({statusCode:200, statusMessage:"Deactivated successfully."});
    });
  }
  catch(err)
  {
    res.json(err);
  }
});
routes.post('/activate-user', function(req, res){
  try{
    var clientData = req.body;
    console.log("client data : ", clientData);
    User.findOneAndUpdate({_id:clientData.id},{isActive:true}, function(err, user){
      if(err) return res.json(err);
      else return res.json({statusCode:200, statusMessage:"Activated successfully."});
    });
  }
  catch(err)
  {
    res.json(err);
  }
});
routes.post('/user-profile', function(req,res){
  try{
    var clientData = req.body;
    //Bgc.findOne({$and:[{'email':clientData.email}, {'mobile':clientData.mobile}]}, function(err, bgcData){
    Bgc.findOne({'user_id': clientData.userId}, function(err, bgcData){
      if(err){
        return res.json(err);
      }
      if(bgcData){
        return res.json({
          data:bgcData, serverBaseURL: serverConfig.serverBaseURLForClient,statusCode:200, statusMessage:"OK"
        })
      }
      else
      {
        //User.findOne({$and:[ {'email':clientData.email}, {'mobile':clientData.mobile}]}, function(err, userData){
        User.findOne({'_id': clientData.userId}, function(err, userData){
          if(err){
            return res.json(err);
          }
          else
          {
            return res.json({
              data:userData, statusCode:200, statusMessage:"OK"
            })
          }
        })
      }
    });
  }
  catch(err){
    res.json(err)
  }
});
routes.post('/create-update-user-bgc-personal-profile', function(req,res){
  try{
    var clientData = req.body;
    var birthDate = clientData.dob.split('/')[2]+'-'+clientData.dob.split('/')[1]+'-'+clientData.dob.split('/')[0];
    console.log(birthDate);
    clientData.birthDate = birthDate;
    JSONValidatorService.jsonValidationWithSchema(req, res, jsonSchema.emp_user.updatePersonalProfile, clientData, function (err, data) {
      if(data){
        Bgc.findOne({user_id: clientData.userId}, function (err, userBGCData) {
          //{'email':clientData.email}, {'mobile':clientData.mobile},
          if (err) {
            return res.json(err);
          }
          if (userBGCData && userBGCData._id) {
            Bgc.findByIdAndUpdate({_id: userBGCData._id},
                {
                  fName: clientData.fName,
                  mName: clientData.mName,
                  lName: clientData.lName,
                  gender: clientData.gender,
                  fatherName: clientData.fatherName,
                  dob: clientData.dob,
                  marital: clientData.marital,
                  nationality: clientData.nationality,
                  aadhaarNo: clientData.aadhaarNo,
                  directContact: clientData.directContact
                }, function (err, data) {
                  if (err) return res.json(err);
                  else {
                    return res.json({statusCode: 200, statusMessage: "updated successfully."});
                  }
                })
          }
          else {
            Bgc.create({
              fName: clientData.fName,
              mName: clientData.mName,
              lName: clientData.lName,
              email: clientData.email,
              mobile: clientData.mobile,
              user_id: clientData.userId,
              gender: clientData.gender,
              fatherName: clientData.fatherName,
              aadhaarNo: clientData.aadhaarNo,
              dob: clientData.dob,
              marital: clientData.marital,
              nationality: clientData.nationality,
              directContact: clientData.directContact
            }, function (err, bgcData) {
              if (err) {
                return res.json(err);
              }
              else {
                return res.json({
                  data: bgcData, statusCode: 200, statusMessage: "Created successfully."
                })
              }
            })
          }
        });
      }
      else
      {
        res.json({err: err});
      }
    });
  }
  catch(err){
    res.json(err)
  }
});
routes.post('/get-user-bgc-contact-details', function(req,res){
  try{
    var clientData = req.body;
    console.log(clientData);
    if(clientData.bgcId){
      Bgc.findOne({_id: clientData.bgcId}, function (err, data) {
        if (err) return res.json(err);
        else {
          if(data && data.contactAddress){
            var responseData = {};
            responseData = data.contactAddress;
            responseData.isSameAsPermanent = data.isSameAsPermanent;
            responseData.isIntermediateAddress = data.isIntermediateAddress;
            return res.json({data :responseData ,statusCode: 200, statusMessage: "OK"});
          }
          else
          {
            return res.json({statusCode: 402, statusMessage: "Please update basic profile first...!!!"});
          }
        }
      })
    }
    else
    {
      res.json({statusCode: 402, statusMessage: "Something bad happened...!!!"});
    }
  }
  catch(err){
    res.json(err)
  }
});
routes.post('/update-user-bgc-contact-details', function(req,res){
  try{
    var clientData = req.body;
    console.log(clientData);
    JSONValidatorService.jsonValidationWithSchema(req, res, jsonSchema.emp_user.updateContactProfile, clientData, function (err, data) {
      if(data){
        var contactAddress = {};
        contactAddress.permanent = clientData.permanent;
        contactAddress.current = clientData.isSameAsPermanent ? clientData.permanent : clientData.current;
        if(clientData.isIntermediateAddress) contactAddress.interMediate = clientData.interMediate;
        Bgc.findByIdAndUpdate({_id: clientData.bgcId},
            {
              contactAddress : contactAddress,
              isSameAsPermanent : clientData.isSameAsPermanent,
              isIntermediateAddress : clientData.isIntermediateAddress
            }, function (err, data) {
              if (err) return res.json(err);
              else {
                return res.json({statusCode: 200, statusMessage: "updated successfully."});
              }
            })
      }
      else
      {
        res.json({err: err});
      }
    });
  }
  catch(err){
    res.json(err)
  }
});
routes.post('/get-user-bgc-education-details', function(req,res){
  try{
    var clientData = req.body;
    console.log(clientData);
    if(clientData.bgcId){
      Bgc.findOne({_id: clientData.bgcId}, function (err, data) {
        if (err) return res.json(err);
        else {
          if(data && data.educationQualification){
            return res.json({data : data.educationQualification ,statusCode: 200, statusMessage: "OK"});
          }
          else
          {
            return res.json({statusCode: 402, statusMessage: "Please update basic profile first...!!!"});
          }
        }
      })
    }
    else
    {
      res.json({statusCode: 402, statusMessage: "Something bad happened...!!!"});
    }
  }
  catch(err){
    res.json(err)
  }
});
routes.post('/update-user-bgc-education-details', function(req,res){
  try{
    var clientData = req.body;
    console.log(clientData);
    JSONValidatorService.jsonValidationWithSchema(req, res, jsonSchema.emp_user.updateEducationDetails, clientData.educationQualification, function (err, data) {
      if(data){
        Bgc.findByIdAndUpdate({_id: clientData.bgcId},
            {
              educationQualification : clientData.educationQualification
            }, function (err, data) {
              if (err) return res.json(err);
              else {
                return res.json({statusCode: 200, statusMessage: "updated successfully."});
              }
            })
      }
      else
      {
        res.json({err: err});
      }
    });
  }
  catch(err){
    res.json(err)
  }
});
routes.post('/get-user-bgc-employment-details', function(req,res){
  try{
    var clientData = req.body;
    console.log(clientData);
    if(clientData.bgcId){
      Bgc.findOne({_id: clientData.bgcId}, function (err, data) {
        if (err) return res.json(err);
        else {
          if(data && data.employmentList){
            var responseData = {};
            responseData.data = data.employmentList;
            responseData.isExperienced = data.isExperienced;
            responseData.canVerifyIn15Days = data.canVerifyIn15Days;
            responseData.dateForVerification = data.dateForVerification;
            responseData.statusCode = 200;
            responseData.statusMessage = "OK";
            return res.json(responseData);
          }
          else
          {
            return res.json({statusCode: 402, statusMessage: "Please update basic profile first...!!!"});
          }
        }
      })
    }
    else
    {
      res.json({statusCode: 402, statusMessage: "Something bad happened...!!!"});
    }
  }
  catch(err){
    res.json(err)
  }
});
routes.post('/update-user-bgc-employment-details', function(req,res){
  try{
    var clientData = req.body;
    console.log(clientData);
    if(!clientData.isExperienced){
      clientData.employmentList = [];
    }
    JSONValidatorService.jsonValidationWithSchema(req, res, jsonSchema.emp_user.updateEmploymentDetails, clientData, function (err, data) {
      if(data){
        Bgc.findByIdAndUpdate({_id: clientData.bgcId},
            {
              employmentList : clientData.employmentList,
              canVerifyIn15Days : clientData.canVerifyIn15Days,
              dateForVerification : clientData.dateForVerification,
              isExperienced : clientData.isExperienced
            }, function (err, data) {
              if (err) return res.json(err);
              else {
                return res.json({statusCode: 200, statusMessage: "updated successfully."});
              }
            })
      }
      else
      {
        res.json({err: err});
      }
    });
  }
  catch(err){
    res.json(err)
  }
});
routes.post('/get-user-bgc-reference-details', function(req,res){
  try{
    var clientData = req.body;
    console.log(clientData);
    if(clientData.bgcId){
      Bgc.findOne({_id: clientData.bgcId}, function (err, data) {
        if (err) return res.json(err);
        else {
          if(data && data.referenceList){
            var responseData = {};
            responseData.data = data.referenceList;
            responseData.statusCode = 200;
            responseData.statusMessage = "OK";
            return res.json(responseData);
          }
          else
          {
            return res.json({statusCode: 402, statusMessage: "Please update basic profile first...!!!"});
          }
        }
      })
    }
    else
    {
      res.json({statusCode: 402, statusMessage: "Something bad happened...!!!"});
    }
  }
  catch(err){
    res.json(err)
  }
});
routes.post('/update-user-bgc-reference-details', function(req,res){
  try{
    var clientData = req.body;
    console.log(clientData);
    JSONValidatorService.jsonValidationWithSchema(req, res, jsonSchema.emp_user.updateReferenceDetails, clientData.referenceList, function (err, data) {
      if(data){
        Bgc.findByIdAndUpdate({_id: clientData.bgcId},
            {
              referenceList : clientData.referenceList
            }, function (err, data) {
              if (err) return res.json(err);
              else {
                return res.json({statusCode: 200, statusMessage: "updated successfully."});
              }
            })
      }
      else
      {
        res.json({err: err});
      }
    });
  }
  catch(err){
    res.json(err)
  }
});
routes.post('/get-user-bgc-identity-details', function(req,res){
  try{
    var clientData = req.body;
    console.log(clientData);
    if(clientData.bgcId){
      Bgc.findOne({_id: clientData.bgcId}, function (err, data) {
        if (err) return res.json(err);
        else {
          if(data && data.identityList){
            var responseData = {};
            responseData.data = data.identityList;
            responseData.statusCode = 200;
            responseData.statusMessage = "OK";
            return res.json(responseData);
          }
          else
          {
            return res.json({statusCode: 402, statusMessage: "Please update basic profile first...!!!"});
          }
        }
      })
    }
    else
    {
      res.json({statusCode: 402, statusMessage: "Something bad happened...!!!"});
    }
  }
  catch(err){
    res.json(err)
  }
});
routes.post('/update-user-bgc-identity-details', function(req,res){
  try{
    var clientData = req.body;
    console.log(clientData);
    JSONValidatorService.jsonValidationWithSchema(req, res, jsonSchema.emp_user.updateIdentityDetails, clientData.identityList, function (err, data) {
      if(data){
        Bgc.findByIdAndUpdate({_id: clientData.bgcId},
            {
              identityList : clientData.identityList
            }, function (err, data) {
              if (err) return res.json(err);
              else {
                return res.json({statusCode: 200, statusMessage: "updated successfully."});
              }
            })
      }
      else
      {
        res.json({err: err});
      }
    });
  }
  catch(err){
    res.json(err)
  }
});
routes.post('/get-user-bgc-education-document-details', function(req,res){
  try{
    var clientData = req.body;
    console.log(clientData);
    if(clientData.bgcId){
      Bgc.findOne({_id: clientData.bgcId}, function (err, data) {
        if (err) return res.json(err);
        else {
          if(data && data.educationQualificationDocumentList){
            var responseData = {};
            responseData.data = data.educationQualificationDocumentList;
            responseData.statusCode = 200;
            responseData.statusMessage = "OK";
            return res.json(responseData);
          }
          else
          {
            return res.json({statusCode: 402, statusMessage: "Please update basic profile first...!!!"});
          }
        }
      })
    }
    else
    {
      res.json({statusCode: 402, statusMessage: "Something bad happened...!!!"});
    }
  }
  catch(err){
    res.json(err)
  }
});




routes.post('/add_city', function(req, res){
  try{
    var clientData = req.body;
    JSONValidatorService.jsonValidationWithSchema(req, res, jsonSchema.add_master, clientData, function(err, data){
      if(data){
        City.findOne({name:clientData.name}, function(err, data){
          if(err) return res.json(err);
          if(data && data.id){
            return res.json({result:data,statusCode: 200, statusMessage: "City name already exist"});
          }
          else
          {
            City.create({
              name: clientData.name
            },function (err, add_city) {
              if (err) return res.json(err);
              else{
                console.log(add_city);
                return res.json({result:add_city,statusCode: 200, statusMessage: "City added successfully...!!!"});
              }
            })
          }
        });
      }
    })
  }
  catch(err)
  {
    res.json(err);
  }
});

routes.post('/upload_city_image/:_id', upload.single('city'), function(req, res){
  try{
    var clientData = req.body;
    clientData._id = req.params._id;
    if (!req.file) {
      console.log("No file received");
      res.json({status: false, message: "File not received"});
    }
    else
    {
      userController.uploadCityImage(clientData._id, req.file, function (err, data) {
        if (err) return res.json({status: false, message: "Cannot save image", error: err});
        else{
          console.log(data);
          return res.json(data);
        }
      });
    }

  }
  catch(err){
    return res.json({status: false, message: "Internal Server Error", error: err});
  }

});

routes.post('/get_city', function(req, res){
  try{
    City.find({}, function(err, city_list){
      if(err) return res.json(err);
      else return res.json({data:city_list,serverBaseURL: serverConfig.domain + ":" + serverConfig.port, statusCode:200, statusMessage:'OK'})
    })
  }
  catch(err)
  {
    res.json(err);
  }
});
routes.post('/edit_city', function(req, res){
  try{
    var clientData = req.body;
    JSONValidatorService.jsonValidationWithSchema(req, res, jsonSchema.add_master, clientData, function(err, data){
      if(err) return res.json(err);
      else
      {
        City.find({name:clientData.name}, function(err, data){
          if(err) return res.json(err);
          if(data && data.length){
            res.json({statusCode:406, message:"City Name already Exist"})
          }
          else
          {
            City.findOneAndUpdate({_id:clientData.id},{name:clientData.name}, function(err, data){
              if(err) return res.json(err);
              else{
                return res.json({statusCode:200, message:"updated successfully."});
              }
            })
          }
        })
      }
    })
  }
  catch(err){
    res.send({statusCode:404, statusMessage:"Unexpected Error", error:err});
  }

});
routes.post('/delete_city', function(req, res){
  try{
    var clientData = req.body;
    City.findOneAndRemove({_id:clientData.id},function(err, deleteData){
      if(err) return res.json(err);
      else{
        return res.json({statusCode:200, statusMessage:"Removed Successfully"});
      }
    })
  }
  catch (err)
  {
    return res.json({status:false,message:"Internal server error"});
  }
});

routes.post('/add_location', function(req, res){
  try{
    var clientData = req.body;
    JSONValidatorService.jsonValidationWithSchema(req, res, jsonSchema.add_master, clientData, function(err, data){
      if(err) return res.json(err);
      if(data){
        Location.findOne({name:clientData.name, city_id:clientData.city_id}, function(err, locationObj){
          if(err) return res.json(err);
          if(locationObj && locationObj.id){
            res.json({result:data,statusCode: 200, statusMessage: "Location name already exist"})
          }
          else
          {
            Location.create({
              name: clientData.name,
              city_id: clientData.city_id
            },function (err, add_city) {
              if (err) return res.json(err);
              else{
                console.log(add_city);
                return res.json({result:add_city,statusCode: 200, statusMessage: "Location added successfully...!!!"});
              }
            })
          }
        })
      }
    })
  }
  catch(err){

  }
});

routes.post('/upload_city_csv',upload.single('city_csv'), function(req, res){
try{
  console.log(req.file);
  if(req.file && req.file.filename.split('.')[1] == 'csv'){
    var recordList = [];
    var csvStream = csv.fromPath(".\\"+req.file.path,{delimiter: ",",escape: '"',headers:true})
      .on("data", function(row, index){
        console.log(row);
        // skip the header row
        //if (index === 0) {
        //  return;
        //}
        // read in the data from the row
        if(row.name && !recordList.some(function(element){return element.name == row.name.trim();})){
          recordList.push({name : row.name.trim()})
        }
      })
      .on("end", function() {
        console.log(recordList);
        var addedCityList = [];
        if(recordList.length){
          async.forEachSeries(recordList, function (item, cb) {
            City.find({
              name: item.name
            }).exec(function (err, foundCity) {
              if (err) return cb(err);
              else if (foundCity && foundCity.length) {
                cb();
              }
              else {
                City.create({
                  name: item.name
                }, function(err, cityData){
                  if (err) return cb(err);
                  else {
                    addedCityList.push(cityData);
                    cb();
                  }
                })
              }
            })
          }, function done(err) {
            if (err) return res.json(err);
            return res.json({statusCode:200, cityData:addedCityList, statusMessage:"Uploaded Successfully.."})
          })
        }
        else
        {
          return res.json({statusCode:200, cityData:addedCityList, statusMessage:"Uploaded Successfully.."})
        }
        //return res.json({records: recordList});
      })
      // if any errors occur
      .on("error", function(error) {
        console.log(error.message);
        return res.json({error: error.message});
      });
  }
  else
  {
    return res.json({statusCode:404, statusMessage:"File is missing or wrong file you have sent.."});
  }

}
  catch (err){
    return res.json(err);
  }
});

routes.post('/add_location_with_image', upload.single('location_image'), (req, res) => {
  try{
    var clientData = req.body;
    if (!req.file) {
      console.log("No file received");
      userController.addLocationWithoutImage(clientData, (err, data) => {
        if (err) return res.json({status: false, message: "Cannot save Location Record", error: err});
        else{
          console.log(data);
          return res.json(data);
        }
      });
    }
    else
    {
      userController.addLocationWithImage(clientData, req.file, (err, data) => {
        if (err) return res.json({status: false, message: "Cannot save image", error: err});
        else{
          console.log(data);
          return res.json(data);
        }
      });
    }
  }
  catch(err) {
    return res.json(err)
  }
});

routes.post('/add_contact', function(req, res){
  try{
    var clientData = req.body;
    JSONValidatorService.jsonValidationWithSchema(req, res, jsonSchema.add_master, clientData, function(err, data){
      if(data){
        Contact.findOne({name:clientData.name}, function(err, dataObj){
          if(err) return res.json(err);
          if(dataObj && dataObj.id){
            if(clientData.group_id && dataObj.group.indexOf(clientData.group_id) == -1){
              dataObj.group.push(clientData.group_id);
              dataObj.save(function(err, data){
                if(err) {
                  res.json({status:500, statusMessage:"Internal Server error"})
                }
                else{
                  return res.json({result:data,statusCode: 200, statusMessage: "Contact name already exist"});
                }
              });
            }
            else
            {
              return res.json({result:dataObj,statusCode: 200, statusMessage: "Contact name already exist"});
            }

          }
          else
          {
            var contactObj = {
              name:clientData.name
            };
            if(clientData.group_id) {
              contactObj.group = [clientData.group_id];
            }
            Contact.create(contactObj,function (err, add_contact) {
              if (err) return res.json(err);
              else{
                console.log(add_contact);
                return res.json({result:add_contact,statusCode: 200, statusMessage: "contact added successfully...!!!"});
              }
            })
          }
        });
      }
    })
  }
  catch(err)
  {
    res.json(err);
  }
});

routes.post('/add_group', function(req, res){
  try{
    var clientData = req.body;
    JSONValidatorService.jsonValidationWithSchema(req, res, jsonSchema.add_master, clientData, function(err, data){
      if(data){
        Group.findOne({name:clientData.name}, function(err, dataObj){
          if(err) return res.json(err);
          if(dataObj && dataObj.id){
            dataObj.contact.push(clientData.contact_id);
            dataObj.save(function(err, data){
              if(err) {
                res.json({status:500, statusMessage:"Internal Server error"})
              }
              else{
                return res.json({result:data,statusCode: 200, statusMessage: "Group name already exist"});
              }
            });
          }
          else
          {
            Group.create({
              name: clientData.name,
              group:[clientData.contact_id]
            },function (err, add_group) {
              if (err) return res.json(err);
              else{
                console.log(add_group);
                return res.json({result:add_group,statusCode: 200, statusMessage: "Group added successfully...!!!"});
              }
            })
          }
        });
      }
    })
  }
  catch(err)
  {
    res.json(err);
  }
});

routes.post('/get_contact', function(req, res){
  try{
    Contact.find().populate('group').exec(function(err, data){
      if(err) return res.json(err);
      if(data && data.length){
        return res.json({data:data,statusCode: 200, statusMessage: "OK"});
      }
    });
  }
  catch(err)
  {
    res.json(err);
  }
});

module.exports = routes;