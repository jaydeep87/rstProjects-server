
  //var Validator = require('jsonschema').Validator;
  var Ajv  = require('ajv');
  var ajv = new Ajv ({allErrors: true,format: 'full'});
  module.exports = {
    /**
     * @param req
     * @param res
     * @param defineSchema
     * @param inputJSON
     * @param callback
     */
    jsonValidationWithSchema: function (req, res, defineSchema, inputJSON, callback) {
      try{
        var valid = ajv.validate(defineSchema, inputJSON);
        if (!valid) console.log(ajv.errors);
        //console.log(ajv.errorsText());
        if (!valid && ajv.errors) {
          var errList = {};
          errList.status = 400;
          var errorList = [];
          if(ajv.errors.length){
            ajv.errors.forEach(function(element) {
              errorList.push(element.dataPath.substring(1) + ' ' + element.message);
            });
          }

          return res.json({
            statusCode : 400,
            statusMessage: errorList.join(', ')
          });
        }
        else {
          return callback(null, inputJSON);
        }
      }
      catch(err)
      {
        return callback(err, null);
      }

    }
  };

