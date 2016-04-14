var express = require('express');
var bignum = require('bignum');
var xml = require('xml');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var rsa = require('../rsa/rsa');
var crypto = require('crypto');

var router = express.Router();
var keys = rsa.generateKeys(1024);

router.get('/', function (req, res, next) {
    var num1, num2;
    var k = keys.privateKey.d;
    console.log(k);

    var p = bignum.prime(1053);
    console.log("esto es tu p = " + p);

    var numerogrande1 = bignum.rand(p);
    var numerogrande2 = bignum.rand(numerogrande1);

    var camacho = [];
    for (var i = 1; i < 5; i++) {
        camacho[i] = k.add(numerogrande1.mul(i)).add(numerogrande2.mul(i * i)).mod(p);
        console.log("Camacho " + i + " = " + camacho[i]);
    }

    var k1 = camacho[1];
    var k3 = camacho[3];
    var k4 = camacho[4];

    var result = k1.mul(((3 / (3 - 1)) * (4 / (4 - 1)))).add(k3.mul(((1 / (1 - 3)) * (4 / (4 - 3))))).add(k4.mul(((1 / (1 - 4)) * (3 / (3 - 4))))).mod(p);
    console.log("Resultado de mierda = " + result);

    if (k.cmp(result) == 0) {
        console.log("Esto funciona bien");
    }

    res.send();
});

module.exports = router;