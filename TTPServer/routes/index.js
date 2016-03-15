var express = require('express');
var messages = require('../models/messages.js');
var publicKeys = require('../models/publicKeys.js');
var router = express.Router();
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var rsa = require('../rsa/rsa-bignum');
var crypto = require('crypto');
var bignum = require('bignum');
var sockjs = require('sockjs');
var http = require('http');

var Pr;
var keys_TTP = rsa.generateKeys(1024);
var m;



/******************************************************************/
/***************** socket ****************************************/

var connections = [];
var connections2 = [];
var usuariosConectados = 0;
var chat = sockjs.createServer();
/*
var cache = [];
JSON.stringify(o, function(key, value) {
    if (typeof value === 'object' && value !== null) {
        if (cache.indexOf(value) !== -1) {
            return;
        }
        cache.push(value);
    }
    return value;
});
cache = null;
*/
function searchUserByConn(conn){

  var a = conn.id;
   var c = -1;
   console.log(connections.length);
   for(var i=0; connections.length > i; i++){
     var b = connections[i].id;

     if (a == b){
       c = i;
       console.log(c);
     }
   }
   return connections2[c];
};

chat.on('connection', function (conn) {
  //connections.push(conn);
  conn.on('data', function (message) {
    var data = JSON.parse(message);

    switch (data.tipo) {
      case 0:
      //User registration
      connections[usuariosConectados] = conn;
      connections2[usuariosConectados] = data.user;
      usuariosConectados++;
      console.log(connections);
      break;
      case 1:
      //  TTP, B, M, PO
      /*  TTP → A : A, B, TR, L, PS
      3. TTP → B : A, L, PO*/

      var MsjToA = {
        A: searchUserByConn(conn)
        , B: data.B
        , Tr: Date.now()
        , L: "L"
        , Ps: "Ps"
      };

      var Ps = bignum.fromBuffer(new Buffer(MsjToA.A + "," + MsjToA.B + "," + MsjToA.Tr + "," + MsjToA.L + "," + data.Po));
      Ps = keys_TTP.privateKey.encrypt(Ps);
      MsjToA.Ps = Ps.toBuffer().toString('base64');
      console.log(MsjToA);
      conn.write(JSON.stringify(MsjToA));

      break;
    }
  });
  conn.on('close', function () {
    var a = NameConnections.indexOf(conn);
    users.splice(users.indexOf(a), 1);
    NameConnections.splice(a, 1);
    for (var ii = 0; ii < connections.length; ii++) {
      connections[ii].write("User " + number + " has disconnected");
    }
  });
});

var server = http.createServer();
chat.installHandlers(server, {
    prefix: '/chat'
});

server.listen(9999, '0.0.0.0');
/*****************************************************************/

router.post('/sendKey', function (req, res) {
  publicKeys.findOneAndUpdate({
    user: req.body.user
  }, {
    user: req.body.user,
    e: req.body.e,
    n: req.body.n
  }, {
    upsert: true
  }, function (err) {
    console.log(err);
  }
);
res.send(200);
});
router.get('/getKey/:user', function (req, res) {
  publicKeys.findOne({
    'user': req.params.user
  }, function (err, message) {
    res.send(message);
  });
});
router.post('/AtoB', function (req, res, next) {
  console.log(req.body);
  m = req.body.M;
  Po = req.body.Po;


  var MsjToA = {
    A: "A"
    , B: "B"
    , Tr: Date.now()
    , L: "L"
    , Ps: "Ps"
  };

  var Ps = bignum.fromBuffer(new Buffer(MsjToA.A + "," + MsjToA.B + "," + MsjToA.Tr + "," + MsjToA.L + "," + Po));
  Ps = keys_TTP.privateKey.encrypt(Ps);
  MsjToA.Ps = Ps.toBuffer().toString('base64');


  var msjToB = {
    A: "A"
    , L: "L"
    , Po: Po
  };
  //msjToB.Po = Po;
  console.log(JSON.stringify(msjToB));
  var xhrTTP = new XMLHttpRequest();

  xhrTTP.open("POST", "http://localhost:3000/TTPtoB");
  xhrTTP.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhrTTP.send(JSON.stringify(msjToB));

  var message = new messages({
    from: "A"
    , to: "B"
    , leido: false
  });
  xhrTTP.onload = function () {
    console.log(xhrTTP.responseText);
  };
  xhrTTP.onerror = function () {
    console.log("Error");
  };


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

  var Pd = bignum.fromBuffer(new Buffer("A" + "," + "B" + "," + Date.now() + "," + "L" + "," + Pr));
  Pd = keys_TTP.privateKey.encrypt(Pd);
  var pd = Pd.toBuffer().toString('base64');


  messages.findOne({
    'from': "A"
    , 'leido': false
  }, function (err, message) {
    if (err)
    res.sendStatus(500);
    else if (message) {
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
      , function (err, data) {
      });
    } else
    res.sendStatus(404);
  });

});

module.exports = router;
