var express = require('express');
var bignum = require('bignum');
var xml = require('xml');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var rsa = require('../rsa/rsa-bignum');
var crypto = require('crypto');
var sockjs = require('sockjs');

var router = express.Router();


/* GET users listing. */
router.get('/', function(req, res, next) {
  var keys = rsa.generateKeys(1024);
  var num1,num2;

  num1 = 30;
  num2 = 10;

  var c1 = keys.publicKey.encrypt(num1);
  var c2 = keys.publicKey.encrypt(num2);

  console.log("############ Suma Homomórfica ###########");
  console.log('num1:', num1.toString());
  console.log('c1:', c1.c.toString(), '\n');

  console.log('num2:', num2.toString());
  console.log('c2:', c2.c.toString(), '\n');


  var sumaEncriptada = c1.c.mul(c2.c).mod(keys.publicKey.n.pow(2));
  console.log("c1*c2:", sumaEncriptada.toString());

  var sum = keys.privateKey.decrypt(sumaEncriptada);
  console.log("Desencriptado de c1*c2:", sum.toString());
  console.log("num1+num2= ", num1+num2, "\n\n");

  tot = num1+num2;

  console.log("############ Multiplicación Homomórfica ###########");

  var mulEncriptada = c1.c.powm(num2,keys.publicKey.n.pow(2));
  console.log("c1^num2; " + mulEncriptada.toString());

  var mul = keys.privateKey.decrypt(mulEncriptada);
  console.log("Desencriptado de c1^num2: " + mul);

  console.log("num1*num2: " + num1*num2);



  res.send(tot.toString());
});

module.exports = router;
