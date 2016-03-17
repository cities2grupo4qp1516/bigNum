angular.module('app.controllers', [])

.controller('loginCtrl', function ($scope) {

})

.controller('perfilCtrl', function ($scope) {

})

.controller('chatsCtrl', ['$scope', '$rootScope', '$state', function ($scope, $rootScope, $state) {
    var chats = [];

    chats.push({
        imagen: "img/marc.jpg"
        , name: "Marc Martínez"
        , text: "Ponte a programar"
    });

    $scope.chats = chats;
    $rootScope.datos = {};

    $scope.getChat = function (value) {
        $rootScope.datos.imagen = value.imagen;
        $rootScope.datos.name = value.name;
        $state.go('chat');
    };
}])

.controller('chatCtrl', ['$scope', '$rootScope', '$state', 'rsaKey', 'Base64', 'mySocket', 'BigInteger', '$http', 'config', function ($scope, $rootScope, $state, rsaKey, Base64, mySocket, BigInteger, $http, config) {
    $rootScope.keys = rsaKey.generateKeys(512);
    var keys = $rootScope.keys;
    console.log(keys);

    $rootScope.ticks = [];

    $rootScope.ticks[0] = false;
    $rootScope.ticks[1] = false;
    $rootScope.ticks[2] = false;
    $rootScope.ticks[3] = false;
    $rootScope.ticks[4] = false;

    var keystosend = {};
    keystosend.user = "B";
    keystosend.e = keys.publicKey.e.toString();
    keystosend.n = keys.publicKey.n.toString();

    $http.post(config.URL + 'sendKey', JSON.stringify(keystosend)).success(function () {
        console.log("Ha ido bien SR. Torbe");
    }).error(function (err) {
        console.log("Muy mal pollito = " + err);
    });

    var datos = $rootScope.datos;

    $scope.datos = datos;

    $scope.goBackChats = function (value) {
        $state.go('menu.chats');
    };

    function sendMessage(mensaje) {
        mySocket.send(mensaje);
    };

    $rootScope.currentConversation = {
        n: 1
        , messages: [{
            me: false
            , text: "Como va eso AdriCouci"
            , ticks: [false, false, true, true, false]
        }, {
            me: true
            , text: "Muy bien Marc, tu que tal?"
            , ticks: [false, false, true, true, false]
        }]
    };

    $rootScope.LandP0 = [];

    $scope.EnviarMensaje = function () {
        var mensaje = $scope.chat.message;
        var hashMensaje = sha256(mensaje);
        var msjToEncrypt = "TTP,A," + hashMensaje;
        var bytes = new BigInteger(rsaKey.String2bin(msjToEncrypt));
        var P0 = keys.privateKey.encrypt(bytes);

        var msjToTTP = {
            tipo: 1
            , TTP: "TTP"
            , B: "A"
            , M: mensaje
            , Po: Base64.encode(P0.toString())
        };

        console.log(msjToTTP);
        sendMessage(JSON.stringify(msjToTTP));
        $rootScope.currentConversation.n++;

        $rootScope.currentConversation.messages.push({
            me: true
            , text: mensaje
            , ticks: [true, true, false, false, false]

        });

        $scope.chat.message = null;
    };

}])