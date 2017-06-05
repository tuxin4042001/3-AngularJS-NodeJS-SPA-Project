'use strict';
angular.module('venturxApp.signup', ['ngRoute']).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/signup', {
        templateUrl: 'views/signup/signup.html', 
        controller: 'SignupCtrl'
    });
}]).controller('SignupCtrl', ['$scope', '$rootScope', '$location', '$http', function ($scope, $rootScope, $location, $http) {
    $scope.newUser = {};
    $scope.register = function () {
        if ($scope.validateForm()) {
            $http.post($rootScope.contextUrl + 'rest/register', $scope.newUser).then(function (reponse) {
                if (reponse.data==="1") {
                    $rootScope.registeredUser = $scope.newUser;
                    $location.path("/signup2");
                }
                else if(reponse.data==="0"){
                    $scope.error= "Failed to store on the server";
                    $scope.hasError = true;
                }
                else{
                    $scope.error= "The user already exists";
                    $scope.hasError = true;
                }
            }, function (error) {
                console.log("error: ", error);
                $scope.error= "The user already exists";
                $scope.hasError = true;
            });
        }
        else {
            $scope.hasError = true;
        }
    };
    $scope.validateForm = function () {
        if (!$scope.newUser.firstName || $scope.newUser.firstName === "" || !$scope.newUser.lastName || $scope.newUser.lastName === "") {
            $scope.error= "First and last name are required fields";
            return false;
        }
        if (!$scope.newUser.email || !$scope.newUser.email.includes('@') || !$scope.newUser.email.includes('.')) {
            $scope.error= "A valid email address is required";
            return false;
        }
        if (!$scope.newUser.password){
            $scope.error= "Please enter a password";
            return false
        }
        if($scope.newUser.password !== $scope.rePassword) {
            $scope.error= "The passwords do not match";
            return false;
        }
        return true;
    };
    // Stripe Response Handler
    $scope.stripeCallback = function (code, result) {
        if (result.error) {
            window.alert('it failed! error: ' + result.error.message);
        }
        else {
            window.alert('success! token: ' + result.id);
        }
    };
}]);
