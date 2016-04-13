var express = require('express');
var bignum = require('bignum');
var xml = require('xml');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var rsa_blind = require('../rsa/rsa-blind');
var crypto = require('crypto');

var router = express.Router();
var keys_blind = rsa_blind.generateKeys(1024);

/* GET users listing. */
router.get('/', function(req, res, next) {

  res.send("Hooooooola");
});

router.get('/publicKey', function(req, res, next) {

//  console.log(keys_blind.publicKey.n.toString());
var publickey = {
        bits: keys_blind.publicKey.bits,
        n: keys_blind.publicKey.n.toString(),
        e: keys_blind.publicKey.e.toString()
};

  res.send(JSON.stringify(publickey));

});

router.post('/', function(req, res, next) {

  console.log(req.body);
  res.send("OK");

});

module.exports = router;
