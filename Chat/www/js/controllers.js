angular.module('app.controllers', [])

.controller('loginCtrl', function ($scope) {

})

.controller('perfilCtrl', function ($scope) {

})

.controller('chatsCtrl', ['$scope', '$rootScope', '$state', function ($scope, $rootScope, $state) {
    var chats = [];
    chats.push({
        imagen: "img/adri.jpg"
        , name: "Adri"
        , text: "Como mola Bareando"
    });

    chats.push({
        imagen: "img/marc.jpg"
        , name: "Marc"
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

.controller('chatCtrl', ['$scope', '$rootScope', '$state', function ($scope, $rootScope, $state) {
    var datos = $rootScope.datos;

    $scope.datos = datos;

    $scope.goBackChats = function (value) {
        $state.go('menu.chats');
    };
}])