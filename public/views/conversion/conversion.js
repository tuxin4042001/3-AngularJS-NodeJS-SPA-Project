'use strict';
angular.module('venturxApp.conversion', ['ngRoute']).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/conversion', {
        templateUrl: 'views/conversion/conversion.html'
        , controller: 'ConversionCtrl'
    });
}]).controller('ConversionCtrl', ['$scope', '$rootScope', '$location', '$http', 'SessionService', function ($scope, $rootScope, $location, $http, SessionService) {

    $rootScope.email = SessionService.getValue("vxsid");
    
    $scope.conversion = {
        email: $rootScope.email
    };
    $scope.saveConversion = function () {
        if ($scope.validateForm()) {
            $http.post($rootScope.contextUrl + 'rest/saveConversion', $scope.conversion).then(function (response) {
                if (response.data=="1") {
                    $location.path("/dashboard");
                    $scope.hasError = false;
                } else if(response.data=="0") {
                    $scope.error="Number of surveys cannot be less than number of signups, orders and intent combined"
                    $scope.hasError = true;
                }
                else if(response.data=="-2"){
                    $scope.error="Could not retrieve number product data."
                    $scope.hasError = true;
                }
                else{

                    console.error("No response received from server during save operation");
                    $scope.error="Server Error"
                                        $scope.hasError = true;


                }
            }, function (error) {
                console.error("Could not save conversion data: ", error);
                $scope.error= "Server error"
                $scope.hasError = true;
            });
        } else {
            console.error("Form data did not pass validation check");
            $scope.hasError = true;
        }
    };
    $scope.validateForm = function () {

        if ($scope.conversion.signedup < 0) {
            $scope.error= "Number of signups must be a valid number";
            return false;
        }
        if ($scope.conversion.money < 0) {
            $scope.error= "Number of preorders must be a valid number";
            return false;
        }
        if ($scope.conversion.intent < 0) {
            $scope.error= "Letter of intent must be a valid whole number";
            return false
        }

        return true;
    };

    $scope.cancel = function () {
        $location.path("/dashboard");
    };


}]);
