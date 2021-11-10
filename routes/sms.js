const express = require("express");
const router = express.Router();
var smsc = require('./smsc_api.js')
const { SmsValidation } = require("../models/sms_validation");
const ResponseController = require("../helpers/response-controller");

smsc.configure({
    login : 'diassms',
    password : '3237013Sms',
});

generateSmsValidationCode();
checkSmsValidationCode(); 


function generateSmsValidationCode() {
  router.get(`/generateSmsCode/:number`, async (req, res) => {
      var number = req.params.number.toString()
      var validationCode = Math.floor(1000 + Math.random() * 9000).toString();

      console.log(number)
      console.log(validationCode)


      smsc.send_sms({
        phones : [req.params.number],
        mes : "Код: " + validationCode
    }, function (data, raw, err, code) {
        if (err) return console.log(err, 'code: '+code);
        console.log(data); // object
        console.log(raw);
        let smsValidationCode = await _createSmsValidationCode(validationCode)
        res.send(data) // string in JSON format
    });

    
  });
}

function _createSmsValidationCode(validationCode) {
    return _postSmsValidationCodeToMongoDB(
      new SmsValidation({
        validationCode: validationCode
      })
    );
  }
  
  function _postSmsValidationCodeToMongoDB(askedQuestion) {
    return askedQuestion.save();
  }


function checkSmsValidationCode() {
    router.get(`/checkSmsCode/:validationCode`, async (req, res) => {
        var validationCode = req.params.validationCode
        let smsValidationCodeRaw = await _getSmsValidationCode(validationCode)
        let smsValidationCode = smsValidationCodeRaw[0].validationCode
        let smsValidationCodeId = smsValidationCodeRaw[0]._id
        console.log("CHECKING")
        console.log(validationCode)
        console.log(smsValidationCodeRaw[0].validationCode)
        if(validationCode == smsValidationCode) {
            res.send("Success")
            SmsValidation.findByIdAndDelete()
        } else {
            res.send("Failure")
        }
        

  
      
    });
}

function _getSmsValidationCode(validationCode) {
    return SmsValidation.find({ validationCode: validationCode })
}



module.exports = router;
