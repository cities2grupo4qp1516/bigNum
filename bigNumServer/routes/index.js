var express = require('express');
var bignum = require('bignum');
var xml = require('xml');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var rsa = require('../rsa/rsa-bignum');
var crypto = require('crypto');
var sockjs = require('sockjs');

var xhrTTP = new XMLHttpRequest();
//var keys_B = rsa.generateKeys(1024);
var res;
var res_keys;
var Po;
var xhrKeys = new XMLHttpRequest();
var hashMensaje;



xhrTTP.onload = function () {

    xhrKeys.open("GET", "http://localhost:4000/getKey/A");
    xhrKeys.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhrKeys.send();

    console.log("5.- Ya he recibido el mensaje de A: ");
    res = JSON.parse(xhrTTP.responseText);
    hashMensaje = crypto.createHash('sha256').update(res.M).digest('hex');
    console.log(hashMensaje);
};

xhrKeys.onload = function () {
    res_keys = JSON.parse(xhrKeys.responseText);

    var total;
    console.log(Po);
    var buffer = new Buffer(Po, 'base64').toString('ascii');

    total = keys_B.publicKey.dec(bignum(buffer),bignum(res_keys.e),bignum(res_keys.n));


    var ok = total.toBuffer().toString().split(",");

    if(ok[2] == hashMensaje){

      console.log("*********************************************");
      console.log("El mensaje ha llegado correctamente!!!!!");
      console.log("*********************************************");


    }else{
      console.log("*********************************************");
      console.log("Te has equivocadooo!!!!!");
      console.log("*********************************************");

    }

};
xhrTTP.onerror = function () {
    console.log("Error");
};

var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.get('/bignum', function (req, res, next) {
    // Operaciones random usando bignum
    var bigNumber = bignum('78291013882729226179197272832498').sub('18237327328340217123747477472837').div(bignum.rand(10).add(1));

    // Conversion del bignumber a un string, este dentro de un buffer, algo asi como una conversion a binario
    var buffer = new Buffer(bigNumber.toString());

    // Codificacion en base64 para mandarlo al cliente
    var bigNumberBase64 = buffer.toString('base64');

    // Cabezera xml, ya que he decidido mandarlo asi
    res.set('Content-Type', 'text/xml');

    //se manda usando la libreria XML
    res.send(xml({'bigNumberBase64': bigNumberBase64}));
});

router.post('/bignum', function (req, res, next) {
    var bigNumberBase64 = req.body['bignumberbase64'];
    var buffer = new Buffer(bigNumberBase64, 'base64').toString('ascii');
    console.log(buffer);

    var bigNumber = bignum(buffer).mul(2);
    console.log(bigNumber);
    buffer = new Buffer(bigNumber.toString());
    bigNumberBase64 = buffer.toString('base64');
    res.set('Content-Type', 'text/xml');
    res.send(xml({'bigNumberBase64': bigNumberBase64}));
});

router.post('/TTPtoB', function (req, res, next) {
    console.log("3.- Yo soy B, y el TTP me dice algo de A: ")
    console.log(req.body);

    Po = req.body.Po;

    var msjToTTL = {
        L: "L",
        Pr: "Pr"
    };


    var Pr = bignum.fromBuffer(new Buffer("TTP" + "," + req.body.A + "," + req.body.L + "," + req.body.Po));
    Pr = keys_B.privateKey.encrypt(Pr);
    msjToTTL.Pr = Pr.toBuffer().toString('base64');

    console.log(msjToTTL);

    xhrTTP.open("POST", "http://localhost:4000/BtoTTP");
    xhrTTP.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhrTTP.send(JSON.stringify(msjToTTL));
    res.send("OK");

});

router.post('/fromAtoB', function (req, res, next) {
    console.log("ab");
    console.log(req.body);
    res.send("ok");
});
module.exports = router;
