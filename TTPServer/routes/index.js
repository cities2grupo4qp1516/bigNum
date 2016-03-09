var express = require('express');
var messages = require('../models/messages.js');
var router = express.Router();
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var rsa = require('../rsa/rsa-bignum');
var crypto = require('crypto');
var bignum = require('bignum');

var xhrTTP = new XMLHttpRequest();
var Pr;
var keys_TTP = rsa.generateKeys(1024);
var m;

xhrTTP.onload = function () {
    console.log(xhrTTP.responseText);
};
xhrTTP.onerror = function () {
    console.log("Error");
};

router.post('/AtoB', function (req, res, next) {
    console.log(req.body);
    m = req.body.M;
    Po = req.body.Po;

/*
    var AtoTTP = {
        TTP: "TTP",
        B: "B",
        M: m,
        Po: ""
    };

      var keys_A = rsa.generateKeys(1024);
      var Po = bignum.fromBuffer(new Buffer(AtoTTP.TTP + ","+ AtoTTP.B + ","+ crypto.createHash("sha256").update(AtoTTP.M).digest("hex")));
      Po = keys_A.privateKey.encrypt(Po);
      AtoTTP.Po = Po.toBuffer().toString('base64');*/



    var MsjToA = {
        A: "A"
      , B: "B"
      , Tr: Date.now()
      , L: "L"
      , Ps: "Ps"
  };

  var Ps = bignum.fromBuffer(new Buffer(MsjToA.A + ","+ MsjToA.B  + ","+ MsjToA.Tr + ","+ MsjToA.L + ","+ Po));
  Ps = keys_TTP.privateKey.encrypt(Ps);
  MsjToA.Ps = Ps.toBuffer().toString('base64');



  var msjToB = {
      A: "A"
      , L: "L"
      , Po: ""
  };
  msjToB.Po = Po;

    xhrTTP.open("POST", "http://localhost:3000/TTPtoB");
    xhrTTP.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhrTTP.send(JSON.stringify(msjToB));

    var message = new messages({
        from: "A"
        , to: "B"
        , leido: false
    });


    message.save(
        function (err) {
            console.log("Error = " + err);
        }
    );


    res.send(MsjToA);


});

router.post('/BtoTTP', function (req, res, next) {
    console.log("4.- B quiere lo de A, se lo mando y se lo digo a A");

    console.log(req.body);
    Pr = req.body.Pr;


    var msjFromAtoB = {
        L: "L"
        , M: m
    };
    res.send(JSON.stringify(msjFromAtoB));
});

router.get('/AconfirmB', function (req, res) {

  var Pd = bignum.fromBuffer(new Buffer("A" + ","+ "B" + ","+ Date.now() + ","+ "L"+ ","+ Pr));
  Pd = keys_TTP.privateKey.encrypt(Pd);
  var pd = Pd.toBuffer().toString('base64');


    messages.findOne({
        'from': "A"
        , 'leido': false
    }, function (err, message) {
        if (err)
            res.sendStatus(500);
        else
        if (message) {
            res.send(JSON.stringify({
                A: "A"
                , B: "B"
                , Td: Date.now()
                , L: "L"
                , K: "K"
                , Pr: Pr
                , Pd: pd
            }));
            messages.findOneAndUpdate({
                    'from': "A"
                    , 'leido': false
                }, {
                    leido: true
                }, {
                    upsert: false
                }
                , function (err, data) {});
        } else
            res.sendStatus(404);
    });

});

module.exports = router;
