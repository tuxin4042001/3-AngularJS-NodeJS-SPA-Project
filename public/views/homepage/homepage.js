'use strict';

angular.module('venturxApp.homepage', ['ngRoute', 'venturxApp'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'views/homepage/homepage.html',
        });
    }]);


