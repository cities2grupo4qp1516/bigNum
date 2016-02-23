var express = require('express');
var bignum = require('bignum');
var xml = require('xml');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/bignum', function(req, res, next){
    // Operaciones random usando bignum
    var bigNumber = bignum('782910138827292261791972728324982').sub('182373273283402171237474774728373').div(8);

    // Conversion del bignumber a un string, este dentro de un buffer, algo asi como una conversion a binario
    var buffer = new Buffer(bigNumber.toString());

    // Codificacion en base64 para mandarlo al cliente
    var bigNumberBase64 = buffer.toString('base64');

    // Cabezera xml, ya que he decidido mandarlo asi
    res.set('Content-Type', 'text/xml');

    //se manda usando la libreria XML
    res.send(xml({'bigNumberBase64': bigNumberBase64}));
});

module.exports = router;
