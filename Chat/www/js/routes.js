angular.module('app.routes', [])

.config(function ($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider



        .state('login', {
        url: '/login'
        , templateUrl: 'templates/login.html'
        , controller: 'loginCtrl'
    })

    .state('menu', {
        url: '/side-menu21'
        , templateUrl: 'templates/menu.html'
        , abstract: true
    })

    .state('menu.perfil', {
        url: '/perfil'
        , views: {
            'side-menu21': {
                templateUrl: 'templates/perfil.html'
                , controller: 'perfilCtrl'
            }
        }
    })

    .state('menu.chats', {
        url: '/chats'
        , views: {
            'side-menu21': {
                templateUrl: 'templates/chats.html'
                , controller: 'chatsCtrl'
            }
        }
    })

    .state('chat', {
        url: '/chat'
        , templateUrl: 'templates/chat.html'
        , controller: 'chatCtrl'
    })

    $urlRouterProvider.otherwise('/login')



});