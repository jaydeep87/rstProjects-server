/**
 * Created by Jaydeep on 02/08/2018.
 */
const mongoose = require('mongoose');
//const timestamps = require('mongoose-timestamp');
const bgcSchema = mongoose.Schema({
  user_id: {type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},

  fName: {type: String, required: true},
  mName: {type: String, default: ""},
  lName: {type: String, default: ""},
  gender:{type: String, default:"male"},
  address: {type: String, default: ""},
  email: {type: String, required: true},
  mobile: {type: String, required: true},


  fatherName: {type: String, default: ""},
  dob: { type: String, default: null },
  marital : {type: String, default: "single"},
  nationality : {type: String, default: "indian"},
  directContact : {type: String, default: ""},
  aadhaarNo : {type: String, default: ""},
  profileImage: {type: String, default: ""},

  contactAddress :{type:mongoose.Schema.Types.Mixed, default:{
    "permanent": { "address": "",
    "addressType": "",
    "fromDate": "",
    "toDate": "",
    "landlord": "",
    "policeStation": "",
    "mobile": "",
    "landline": ""},
    "current": {"address": "",
    "addressType": "",
    "fromDate": "",
    "toDate": "",
    "landlord": "",
    "policeStation": "",
    "mobile": "",
    "landline": ""},
    "interMediate": { "address": "",
    "addressType": "",
    "fromDate": "",
    "toDate": "",
    "landlord": "",
    "policeStation": "",
    "mobile": "",
    "landline": ""}
  }},
  isSameAsPermanent : {type:Boolean, default:false},
  isIntermediateAddress : {type:Boolean, default:false},


  educationQualification : [],

  employmentList : [],
  canVerifyIn15Days : {type:String, default: "yes"},
  dateForVerification :  {type: String, default: ""},
  isExperienced:{type:Boolean, default:false},

  referenceList : [],

  identityList : [],

  educationQualificationDocumentList : [],
  employmentDocumentList : [],
  identityDocumentList : [],
  otherDocumentList : [],

  createdAt:{type: Date, default: Date.now},
  updatedAt:{type: Date, default: Date.now}

});

//studentSchema.plugin(timestamps);

const Bgc = mongoose.model('Bgc', bgcSchema);

module.exports = Bgc;
