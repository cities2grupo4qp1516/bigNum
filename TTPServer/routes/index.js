var express = require('express');
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
        A: "A",
        B: "B",
        Tr: Date.now(),
        L: "L",
        Ps: "Ps"
    };
    res.send(MsjToA);

    var msjToB = {
        A: "A",
        L: "L",
        P0: "P0"
    };
    xhrTTP.open("POST", "http://localhost:3000/TTPtoB");
    xhrTTP.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhrTTP.send(JSON.stringify(msjToB));

});

router.post('/BtoTTP', function (req, res, next) {
    console.log("B quiere lo de A, se lo mando y se lo digo a A");

    var msjFromAtoB = {
        L: "L",
        M: "M"
    };
    res.send(JSON.stringify(msjFromAtoB));
});

module.exports = router;
