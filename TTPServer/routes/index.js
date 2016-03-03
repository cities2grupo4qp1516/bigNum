var express = require('express');
var messages = require('../models/messages.js');
var router = express.Router();
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var xhrTTP = new XMLHttpRequest();

xhrTTP.onload = function () {
    console.log(xhrTTP.responseText);
};
xhrTTP.onerror = function () {
    console.log("Error");
};

router.post('/AtoB', function (req, res, next) {
    console.log(req.body);
    var MsjToA = {
        A: "A"
        , B: "B"
        , Tr: Date.now()
        , L: "L"
        , Ps: "Ps"
    };
    res.send(MsjToA);

    var msjToB = {
        A: "A"
        , L: "L"
        , P0: "P0"
    };
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
});

router.post('/BtoTTP', function (req, res, next) {
    console.log("4.- B quiere lo de A, se lo mando y se lo digo a A");

    var msjFromAtoB = {
        L: "L"
        , M: "M"
    };
    res.send(JSON.stringify(msjFromAtoB));
});

router.get('/AconfirmB', function (req, res) {

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
                , Pr: "Pr"
                , Pd: "Pd"
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