/**
 * Created by Jaydeep on 02/08/2018.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
//const timestamps = require('mongoose-timestamp');
const userSchema = mongoose.Schema({
  fName: {type: String, required: true},
  mName: {type: String, default: ""},
  lName: {type: String, default: ""},
  gender:{type: String, default:"male"},
  address: {type: String, default: ""},
  city: {type: String, default: null},
  state: {type: String, default: null},
  pin: {type: String, default: null},
  profileImage: {type: String, default: ""},
  country: {type: String, default: "India"},
  email: {type: String, unique:true, required: true},
  mobile: {type: String, unique:true, required: true},
  password: {type: String, required: true},
  isAdmin: {type:Boolean, default:false},
  designation: {type:String, default:""},
  accountCreatedBy : {type:String, default:"admin"},
  isActive : {type:Boolean, default:true},
  createdAt:{type: Date, default: Date.now},
  updatedAt:{type: Date, default: Date.now}

});

//studentSchema.plugin(timestamps);

const User = mongoose.model('User', userSchema);

module.exports = User;


/**
 * @param password
 * @param hash
 * @param callback
 */
module.exports.comparePassword = function comparePassword(password, hash, callback) {
  bcrypt.compare(password, hash, function (err, isMatch) {
    if (err) {
      callback(err, null);
    }
    else {
      callback(null, isMatch);
    }
  });
};