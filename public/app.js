'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('venturxApp', [
  'ngRoute',
  'venturxApp.login',
  'venturxApp.signup',
  'venturxApp.update',
  'venturxApp.dashboard',
  'venturxApp.product',
  'venturxApp.conversion',
  'venturxApp.engagement',
  'venturxApp.runway',
  'venturxApp.homepage',
  'venturxApp.wizardForm'
]);

app.config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
        $routeProvider.when('/termsofuse', {
            templateUrl: 'views/termsofuse/termsofuse.html' }); 
                $routeProvider.when('/privacypolicy', {
            templateUrl: 'views/privacypolicy/privacypolicy.html' });       
    $routeProvider.otherwise({
        redirectTo: '/login'
    });
}]);

app.config(['$windowProvider', function ($windowProvider) {}]);

// Create a service that accesses session storage
app.service('SessionService', function ($window) {
    var service = this;
    var sessionStorage = $window.sessionStorage;

    service.getValue = function (key) {
        return sessionStorage.getItem(key);
    };

    service.setValue = function (key, value) {
        sessionStorage.setItem(key, value);
    };

    service.unsetValue = function (key) {
        sessionStorage.removeItem(key);
    };
});

app.controller('HeadCtrl', ['$scope', '$rootScope', '$location', 'SessionService', function ($scope, $rootScope, $location, SessionService) {
console.log("User ID cookie = ", SessionService.getValue("vxsid"));

    $rootScope.contextUrl = $location.absUrl().substring(0, $location.absUrl().indexOf("#!"))
    //$rootScope.contextUrl = "http://cust1.lcis.land:8020/";

    $scope.isLoggedIn = function () {
        var userID = SessionService.getValue("vxsid");
        return (userID && userID !== undefined);
    };

    $scope.logout = function () {
        SessionService.unsetValue("vxsid");
        $rootScope.email = null;
        $location.path("/login");
    }
}]);
