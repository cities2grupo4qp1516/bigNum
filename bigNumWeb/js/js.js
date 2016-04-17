 /**
  * Created by BestTeamEver on 21/02/2016.
  */

 var bigNumApp = angular.module('bigNumApp', ['jsbn.BigInteger', 'bd.sockjs']);

 bigNumApp.constant('config', {
     URL: "http://localhost:3000/",
     URLTTP: "http://localhost:4000/"
 });

 bigNumApp.controller('EncryptController', ['$scope', '$rootScope', '$http', 'BigInteger', 'rsaKey', 'primeNumber', 'Base64', function ($scope, $rootScope, $http, BigInteger, rsaKey, primeNumber, Base64) {

     function downloadURI(uri, name) {
         var link = document.createElement("a");
         link.download = name;
         link.href = uri;
         link.click();
     }

     $scope.encrypt = function () {
         Decimal.config({
             precision: 300
         });
         var keys = rsaKey.generateKeys(256);
         var k = keys.privateKey.d;
         console.log(k.toString());
         var p = primeNumber.aleatorio(1500);
         console.log("Esta es la p = ");
         console.log(p.toString());
         var bytes = new BigInteger(rsaKey.String2bin($scope.aencriptar));
         var papafrancisco = keys.publicKey.encrypt(bytes);
         $rootScope.encriptado = papafrancisco.toString();
         var numerogrande1 = new BigInteger(Decimal.random(300).mul(Decimal(10).pow(300)).toString());
         var numerogrande2 = new BigInteger(Decimal.random(300).mul(Decimal(10).pow(300)).toString());

         var camacho = [];
         var numeros = [];
         for (var i = 1; i < 5; i++) {
             camacho[i] = k.add(numerogrande1.multiply(new BigInteger(i.toString()))).add(numerogrande2.multiply(new BigInteger((i * i).toString()))).mod(p);
             console.log("Camacho " + i + " = " + camacho[i]);
             numeros[i] = new BigInteger(i.toString());

             var file = "";
             var dataTofile = {
                 n: keys.publicKey.n.toString(),
                 x: i,
                 camacho: camacho[i].toString(),
                 p: p.toString()
             }
             var data = new Blob([Base64.encode(JSON.stringify(dataTofile))], {
                 type: 'text/plain'
             });
             file = window.URL.createObjectURL(data);
             downloadURI(file, "Llave número: " + i + ".txt");
         }
     }

}]);

 bigNumApp.controller('DecryptController', ['$scope', '$rootScope', '$http', 'BigInteger', 'rsaKey', 'primeNumber', 'Base64', function ($scope, $rootScope, $http, BigInteger, rsaKey, primeNumber, Base64) {
     var claves = {
         n: null,
         x: [],
         camacho: [],
         i: 0,
         p: null
     }
     $scope.decrypt = function () {

         var c = new BigInteger("0");
         claves.camacho.forEach(function (item, index) {
             var a = new BigInteger("1");
             claves.x.forEach(function (itemx, indexx) {
                 if (indexx != index) {
                     var d = claves.x[indexx].subtract(claves.x[index]);
                     if (d.signum() == -1)
                         d = d.add(claves.p);
                     var e = d.modInverse(claves.p);
                     var b = claves.x[indexx].multiply(e);
                     a = b.multiply(a).mod(claves.p);
                 }
             });
             var d = item.multiply(a).mod(claves.p);
             c = d.add(c).mod(claves.p);
         });


         var desencriptado1 = new BigInteger($rootScope.encriptado).modPow(c, claves.n);
         var texto = rsaKey.bin2String(desencriptado1.toByteArray());
         console.log(texto);
         $rootScope.encriptado = texto;
     }

     $scope.loadKeys = function () {
         var ok = 0;
         $('#files').val("");
         $('#files').trigger('click');
         jQuery("input#files").change(function () {
             var files = document.getElementById('files').files;
             var reader = new FileReader();
             reader.readAsText(files[0]);

             reader.onloadend = function () {
                 var fileKeys = JSON.parse(Base64.decode(reader.result));

                 console.log("x tiene " + claves.x.length);

                 claves.x.forEach(function (item, index) {
                     if (fileKeys.x == item) {
                         ok = 1;
                     }
                 });

                 if (ok == 0) {
                     if (claves.n == null && claves.p == null) {
                         //solo hace falta cargar los modulos la primera vez, asi ademas sirven para comprobar que los demas ficheros son de la misma guerra y no liarla 
                         claves.n = new BigInteger(fileKeys.n.toString());
                         claves.p = new BigInteger(fileKeys.p.toString());
                     } else if (fileKeys.n != claves.n && fileKeys.p != claves.p) {
                         //error, no hablamos de las mismas claves
                     }

                     claves.camacho.push(new BigInteger(fileKeys.camacho.toString()));
                     claves.x.push(new BigInteger(fileKeys.x.toString()));
                     claves.i++;
                     if (claves.i == 3) {
                         $("#boton").css("display", "block");
                         console.log("Vamos a ver si esta todo como deberia: ");
                         console.log(claves);
                     }
                 }
                 //no es necesario, pero mas vale prevenir...
                 ok = 0;
             };
         });
     };

}]);

 bigNumApp.controller('ChatController', ['$scope', '$rootScope', 'BigInteger', 'rsaKey', 'Base64', 'config', 'mySocket', function ($scope, $rootScope, BigInteger, rsaKey, Base64, config, sock) {
     $rootScope.keys = rsaKey.generateKeys(512);
     var keys = $rootScope.keys;
     $rootScope.LandP0 = [];
     $rootScope.ticks = [];

     $rootScope.ticks[0] = true;
     $rootScope.ticks[1] = false;
     $rootScope.ticks[2] = false;
     $rootScope.ticks[3] = false;
     $rootScope.ticks[4] = false;

     var xhrTTP = new XMLHttpRequest();
     var keysToTTP = {
         user: "A",
         e: keys.publicKey.e.toString(),
         n: keys.publicKey.n.toString()
     };
     xhrTTP.open("POST", config.URLTTP + "sendKey");
     xhrTTP.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
     xhrTTP.send(JSON.stringify(keysToTTP));

     $scope.conversations = {
         B: {
             name: "AdriCouci"
         },
         C: {
             name: "Nacho"
         },
         D: {
             name: "Javi"
         }
     };
     var conversaciones = [];
     conversaciones["AdriCouci"] = {
         n: 1,
         name: "AdriCouci",
         messages: [{
             me: true,
             text: "Como va eso AdriCouci",
             ticks: [true, true, false, false, false]
        }, {
             me: false,
             text: "Muy bien Marc, tu que tal?",
             ticks: [false, false, true, true, false]
        }]
     };
     conversaciones["Nacho"] = {
         name: "Nacho",
         messages: [{
             me: true,
             text: "Nachooo! Como llevas el chat de la web?",
             datetime: "2015-08-05T14:16:55+02:00"
        }, {
             me: false,
             text: "Pues bien! Creo que ha quedado guapo",
             datetime: "2015-08-05T14:15:55+02:00"
        }]
     };
     conversaciones["Javi"] = {
         name: "Nacho",
         messages: [{
             me: true,
             text: "Buenas Javi! Cuando quedamos para hacer el Ionic?",
             datetime: "2015-08-05T14:15:55+02:00"
        }, {
             me: false,
             text: "Cuando te vaya bien jefee!",
             datetime: "2015-08-05T14:16:55+02:00"
        }]
     };
     console.log(conversaciones);

     $scope.switchConversation = function (conv) {
         console.log(conv.name);
         $scope.currentConversation = conversaciones[conv.name];
     };

     $rootScope.currentConversation = {
         n: 1,
         name: "AdriCouci",
         messages: [{
             me: true,
             text: "Como va eso AdriCouci",
             ticks: [true, true, false, false, false]
        }, {
             me: false,
             text: "Muy bien Marc, tu que tal?",
             ticks: [false, false, true, true, false]
        }]
     };

     $scope.enviar = function () {
         var mensaje = $scope.message;
         var hashMensaje = sha256(mensaje);
         var msjToEncrypt = "TTP,B," + hashMensaje;
         var bytes = new BigInteger(rsaKey.String2bin(msjToEncrypt));
         var P0 = keys.privateKey.encrypt(bytes);
         var msjToTTP = {
             tipo: 1,
             TTP: "TTP",
             B: "B",
             M: mensaje,
             Po: Base64.encode(P0.toString())
         };
         console.log($scope.message);
         sendMessage(JSON.stringify(msjToTTP));

         $rootScope.currentConversation.n++;

         $rootScope.currentConversation.messages.push({
             me: true,
             text: mensaje,
             ticks: [true, true, false, false, false]

         });

         $scope.message = null;
     }
     var messages = [];

     function sendMessage(mensaje) {
         sock.send(mensaje);
     };
     //TTP, B, M, PO
     var test = {
         tipo: 1,
         TTP: "TTP",
         B: "B",
         M: "HOLA",
         PO: "cosa rara"
     }

}]).factory('mySocket', ['socketFactory', '$rootScope', 'BigInteger', 'rsaKey', 'Base64', 'config', '$http', function (socketFactory, $rootScope, BigInteger, rsaKey, Base64, config, $http) {
     var sockjs = new SockJS('http://localhost:9999/chat');
     var respuestaTTP = "";

     sockjs.onopen = function () {
         console.log("ola");
         var mensaje = {};
         mensaje.tipo = 0;
         mensaje.user = "A";
         mensaje = JSON.stringify(mensaje);
         sockjs.send(mensaje);
     };

     sockjs.onmessage = function (e) {
         console.log($rootScope.keys);
         console.log(e.data);
         var mensaje = JSON.parse(e.data);
         switch (mensaje.Type) {
         case 2:
             $rootScope.LandP0[mensaje.L] = mensaje.Po;
             var msjToEncrypt = "TTP, B, " + mensaje.L + mensaje.Po;
             var bytes = new BigInteger(rsaKey.String2bin(msjToEncrypt));
             var Pr = Base64.encode($rootScope.keys.privateKey.encrypt(bytes).toString());

             var msjToTTP = {
                 tipo: 2,
                 L: mensaje.L,
                 Pr: Pr
             };

             sockjs.send(JSON.stringify(msjToTTP));
             break;

         case 3:
             $rootScope.currentConversation.n++;
             $rootScope.currentConversation.messages.push({
                 me: false,
                 text: mensaje.M,
                 ticks: [true, false, false, false, false]
             });
             $http.get(config.URLTTP + 'getKey/B').success(function (diferente) {
                 console.log("Ahi van las claves publicas!: ");
                 console.log(diferente);

                 var camacho = rsaKey.bin2String($rootScope.keys.publicKey.dec(new BigInteger(Base64.decode($rootScope.LandP0[mensaje.L])), new BigInteger(diferente.e), new BigInteger(diferente.n)).toByteArray()).split(",")[2] == sha256(mensaje.M) ? function () {
                     console.log("mensaje correcto");
                     $rootScope.currentConversation.messages[$rootScope.currentConversation.n].ticks = [false, false, true, true, false];
                 } : function () {
                     console.log("mensaje incorrecto");
                     $rootScope.currentConversation.messages[$rootScope.currentConversation.n].ticks = [false, false, false, false, true];
                 };

                 camacho();

             }).error(function (err) {
                 console.log("Muy mal pollito = " + err);
             });
             break;

         }
     };

     mySocket = socketFactory({
         socket: sockjs
     });

     return mySocket;
}]);



 bigNumApp.controller('BignumController', ['$scope', '$http', 'BigInteger', 'rsaKey', 'Base64', 'config', function ($scope, $http, BigInteger, rsaKey, Base64, config) {
         var bigNumber;
         var keys;
         var xhr = new XMLHttpRequest();
         var xhrTTP = new XMLHttpRequest();
         $scope.pseudonimo = "";
         $scope.conversations = {
             A: {
                 name: "A"
             }
         };
         $scope.currentConversation = {
             name: "A",
             messages: {
                 B: {
                     me: false,
                     text: "hola",
                     datetime: "2015-08-05T14:15:55+02:00"
                 },
                 p: {
                     me: true,
                     text: "hola",
                     datetime: "2015-08-05T14:16:55+02:00"
                 }
             }
         };


         function downloadURI(uri, name) {
             var link = document.createElement("a");
             link.download = name;
             link.href = uri;
             link.click();
         }


         xhr.onload = function () {
             BigNumber.config({
                 DECIMAL_PLACES: 10
             });
             var bigNumberBase64 = xhr.responseXML.documentElement.childNodes[0].nodeValue;
             var bigNumberStr = Base64.decode(bigNumberBase64);
             bigNumber = new BigNumber(bigNumberStr);

             setTimeout(function () {
                 $scope.$apply(function () {
                     $scope.bignum = bigNumber;

                 });
             }, 1000);
         };
         xhr.onerror = function () {
             console.log("Error obteniendo el XML.");
         };
         xhrTTP.onload = function () {
             console.log("2.- El TTP me contesta a mi peticion: ");
             var respuesta;
             try {
                 respuesta = JSON.parse(xhrTTP.response);
                 if (respuesta.Ps == undefined)
                     alert("B ya ha leido el mensaje");
             } catch (err) {
                 alert("B aun no ha leido el mensaje");
             }
             console.log(respuesta);
         };
         xhrTTP.onerror = function () {
             console.log("Error");
         };

         /*    xhr.open("GET", config.URL + "bignum");
             xhr.responseType = "document";
             xhr.send();*/
         $scope.registrar = function () {

             $http.post(config.URL + 'blind', $scope.pseudonimo)
                 .success(function (data) {

                 })
                 .error(function (data) {
                     console.log('Error: ' + data);

                 });
         };

         $scope.double = function () {
             var enviar = Base64.encode(bigNumber.toString());
             var xw = new XMLWriter('UTF-8');

             xw.writeStartDocument();
             xw.writeElementString('bigNumberBase64', enviar);
             xw.writeEndDocument();
             xhr.open("POST", config.URL + "bignum", true);
             xhr.setRequestHeader("Content-type", "text/xml");
             xhr.send(xw.flush());
         };
         $scope.random = function () {
             xhr.open("GET", config.URL + "bignum");
             xhr.responseType = "document";
             xhr.send();
         };
         $scope.createKeys = function () {
             keys = rsaKey.generateKeys(512);
             var keysToFile = {
                 publicKey: {
                     n: keys.publicKey.n.toString(),
                     e: keys.publicKey.e.toString(),
                     bits: keys.publicKey.bits
                 },
                 privateKey: {
                     p: keys.privateKey.p.toString(),
                     q: keys.privateKey.q.toString(),
                     d: keys.privateKey.d.toString(),
                     publicKey: {
                         n: keys.publicKey.n.toString(),
                         e: keys.publicKey.e.toString(),
                         bits: keys.publicKey.bits
                     }
                 }
             };
             var file = "";
             var data = new Blob([Base64.encode(JSON.stringify(keysToFile))], {
                 type: 'text/plain'
             });
             var keysToTTP = {
                 user: "A",
                 e: keys.publicKey.e.toString(),
                 n: keys.publicKey.n.toString()
             };

             if (file !== null) {
                 window.URL.revokeObjectURL(file);
             }

             file = window.URL.createObjectURL(data);

             xhrTTP.open("POST", config.URLTTP + "sendKey");
             xhrTTP.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
             xhrTTP.send(JSON.stringify(keysToTTP));

             downloadURI(file, "keys.RSA");
         };
         $scope.loadKeys = function () {
             $('#files').trigger('click');
             jQuery("input#files").change(function () {
                 var files = document.getElementById('files').files;
                 var reader = new FileReader();
                 reader.readAsText(files[0]);

                 reader.onloadend = function () {
                     var fileKeys = JSON.parse(Base64.decode(reader.result));
                     keys = rsaKey.importKeys(JSON.parse(Base64.decode(reader.result)));
                     var keysToTTP = {
                         user: "A",
                         e: keys.publicKey.e.toString(),
                         n: keys.publicKey.n.toString()
                     };
                     xhrTTP.open("POST", config.URLTTP + "sendKey");
                     xhrTTP.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                     xhrTTP.send(JSON.stringify(keysToTTP));
                 };
             });
         };
         $scope.sendTTP = function () {
             var mensaje = "Hola soy Torbe";
             var hashMensaje = sha256(mensaje);
             var msjToEncrypt = "TTP,B," + hashMensaje;
             var bytes = new BigInteger(rsaKey.String2bin(msjToEncrypt));
             var P0 = keys.privateKey.encrypt(bytes);
             var msjToTTP = {
                 TTP: "TTP",
                 B: "B",
                 M: mensaje,
                 Po: Base64.encode(P0.toString())
             };

             console.log("1.- Soy A y mando esto al TTP: ");
             console.log(msjToTTP);
             xhrTTP.open("POST", config.URLTTP + "AtoB");
             xhrTTP.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
             xhrTTP.send(JSON.stringify(msjToTTP));
             msjToTTP.tipo = 1;
             sendMessage(JSON.stringify(msjToTTP));

         };
         $scope.confirmTTP = function () {
             xhrTTP.open("GET", config.URLTTP + "AconfirmB");
             xhrTTP.send();
         };
    }])
     .factory('rsaKey', ['BigInteger', 'primeNumber', function (BigInteger, primeNumber) {
         var rsa = {
             publicKey: function (bits, n, e) {
                 this.bits = bits;
                 this.n = n;
                 this.e = e;
             },
             privateKey: function (p, q, d, publicKey) {
                 this.p = p;
                 this.q = q;
                 this.d = d;
                 this.publicKey = publicKey;
             },
             importKeys: function (impotedKeys) {
                 var keys = {};
                 impotedKeys.privateKey.publicKey.e = new BigInteger(impotedKeys.privateKey.publicKey.e);
                 impotedKeys.privateKey.publicKey.n = new BigInteger(impotedKeys.privateKey.publicKey.n);
                 keys.publicKey = new rsa.publicKey(impotedKeys.publicKey.bits, new BigInteger(impotedKeys.publicKey.n), new BigInteger(impotedKeys.publicKey.e));
                 keys.privateKey = new rsa.privateKey(new BigInteger(impotedKeys.privateKey.p), new BigInteger(impotedKeys.privateKey.q), new BigInteger(impotedKeys.privateKey.d), impotedKeys.privateKey.publicKey);
                 return keys;
             },
             generateKeys: function (bitlength) {
                 var p, q, n, phi, e, d, keys = {},
                     one = new BigInteger('1');
                 this.bitlength = bitlength || 2048;
                 console.log("Generating RSA keys of", this.bitlength, "bits");
                 p = primeNumber.aleatorio(bitlength);
                 do {
                     q = primeNumber.aleatorio(bitlength);
                 } while (q.compareTo(p) === 0);
                 n = p.multiply(q);

                 phi = p.subtract(one).multiply(q.subtract(one));

                 e = new BigInteger('65537');
                 d = e.modInverse(phi);

                 keys.publicKey = new rsa.publicKey(this.bitlength, n, e);
                 keys.privateKey = new rsa.privateKey(p, q, d, keys.publicKey);
                 return keys;
             },
             String2bin: function (str) {
                 var bytes = [];
                 for (var i = 0; i < str.length; ++i) {
                     bytes.push(str.charCodeAt(i));
                 }
                 return bytes;
             },
             bin2String: function (array) {
                 var result = "";
                 for (var i = 0; i < array.length; i++) {
                     result += String.fromCharCode(array[i]);
                 }
                 return result;
             }
         };


         rsa.publicKey.prototype = {
             encrypt: function (m) {
                 return m.modPow(this.e, this.n);
             },
             decrypt: function (c) {
                 return c.modPow(this.e, this.n);
             },
             dec: function (c, pass, passs) {
                 return c.modPow(pass, passs);
             }
         };

         rsa.privateKey.prototype = {
             encrypt: function (m) {
                 return m.modPow(this.d, this.publicKey.n);
             },
             decrypt: function (c) {
                 return c.modPow(this.d, this.publicKey.n);
             }
         };
         return rsa;
    }])
     .factory('primeNumber', ['BigInteger', function (BigInteger) {
         Decimal.config({
             precision: 300,
             rounding: 4,
             toExpNeg: -7,
             toExpPos: 100,
             maxE: 9e15,
             minE: -9e15
         });
         var primo = {
             aleatorio: function (bitLength) {
                 var isPrime = false;
                 var diff = Decimal.sub(Decimal.pow(2, bitLength), Decimal.pow(2, bitLength - 1));
                 while (!isPrime) {
                     var randomNumber = Decimal.add((Decimal.mul(Decimal.random(300), Decimal.pow(2, bitLength)).round()), diff);
                     var rnd = new BigInteger(randomNumber.toString());
                     if (rnd.isProbablePrime(3)) {
                         isPrime = true;
                     }
                 }
                 return rnd;
             }
         };
         return primo;
    }])
     .factory('Base64', [function () {
         var Base64 = {
             _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
             encode: function (e) {
                 var t = "";
                 var n, r, i, s, o, u, a;
                 var f = 0;
                 e = Base64._utf8_encode(e);
                 while (f < e.length) {
                     n = e.charCodeAt(f++);
                     r = e.charCodeAt(f++);
                     i = e.charCodeAt(f++);
                     s = n >> 2;
                     o = (n & 3) << 4 | r >> 4;
                     u = (r & 15) << 2 | i >> 6;
                     a = i & 63;
                     if (isNaN(r)) {
                         u = a = 64
                     } else if (isNaN(i)) {
                         a = 64
                     }
                     t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
                 }
                 return t
             },
             decode: function (e) {
                 var t = "";
                 var n, r, i;
                 var s, o, u, a;
                 var f = 0;
                 e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
                 while (f < e.length) {
                     s = this._keyStr.indexOf(e.charAt(f++));
                     o = this._keyStr.indexOf(e.charAt(f++));
                     u = this._keyStr.indexOf(e.charAt(f++));
                     a = this._keyStr.indexOf(e.charAt(f++));
                     n = s << 2 | o >> 4;
                     r = (o & 15) << 4 | u >> 2;
                     i = (u & 3) << 6 | a;
                     t = t + String.fromCharCode(n);
                     if (u != 64) {
                         t = t + String.fromCharCode(r)
                     }
                     if (a != 64) {
                         t = t + String.fromCharCode(i)
                     }
                 }
                 t = Base64._utf8_decode(t);
                 return t
             },
             _utf8_encode: function (e) {
                 e = e.replace(/\r\n/g, "\n");
                 var t = "";
                 for (var n = 0; n < e.length; n++) {
                     var r = e.charCodeAt(n);
                     if (r < 128) {
                         t += String.fromCharCode(r)
                     } else if (r > 127 && r < 2048) {
                         t += String.fromCharCode(r >> 6 | 192);
                         t += String.fromCharCode(r & 63 | 128)
                     } else {
                         t += String.fromCharCode(r >> 12 | 224);
                         t += String.fromCharCode(r >> 6 & 63 | 128);
                         t += String.fromCharCode(r & 63 | 128)
                     }
                 }
                 return t
             },
             _utf8_decode: function (e) {
                 var t = "";
                 var n = 0;
                 var r = c1 = c2 = 0;
                 while (n < e.length) {
                     r = e.charCodeAt(n);
                     if (r < 128) {
                         t += String.fromCharCode(r);
                         n++
                     } else if (r > 191 && r < 224) {
                         c2 = e.charCodeAt(n + 1);
                         t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                         n += 2
                     } else {
                         c2 = e.charCodeAt(n + 1);
                         c3 = e.charCodeAt(n + 2);
                         t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                         n += 3
                     }
                 }
                 return t
             }
         }
         return Base64;
    }]).filter('mlChatDate', mlChatDate);

 function mlChatDate() {
     return filter;

     function filter(input) {
         if (!input || !input.length) {
             return;
         }
         console.log(moment(input).format('LLL'));
         return moment(input).format('LLL');
     }
 }