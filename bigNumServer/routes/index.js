var express = require('express');
var bignum = require('bignum');
var xml = require('xml');

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

module.exports = router;
