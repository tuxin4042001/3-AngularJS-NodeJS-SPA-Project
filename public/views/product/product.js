'use strict';
angular.module('venturxApp.product', ['ngRoute']).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/product', {
        templateUrl: 'views/product/product.html'
        , controller: 'ProductCtrl'
    });
        $routeProvider.when('/ProductSurveySample', {
        templateUrl: 'views/product/ProductSurveySample.pdf'
        , controller: 'ProductCtrl'
    });
}]).controller('ProductCtrl', ['$scope', '$rootScope', '$location', '$http', 'SessionService', function ($scope, $rootScope, $location, $http, SessionService) {

    $rootScope.email = SessionService.getValue("vxsid");
    $scope.product = {
        email: $rootScope.email
    };
    $scope.saveProduct = function () {
        if ($scope.validateForm()) {
            $http.post($rootScope.contextUrl + 'rest/saveProduct', $scope.product).then(function (response) {
                if (response.data) {
                    $location.path("/dashboard");
                } else {
                    console.error("No response received from server during save operation");
                    $scope.hasError = true;
                }
            }, function (error) {
                console.error("Could not save Product data: ", error);
                $scope.hasError = true;
            });
        } else {
            console.error("Form data did not pass validation check");
            $scope.hasError = true;
        }
    };
    $scope.validateForm = function () {

        if ($scope.product.surveyed < 0) {
            console.error("No value provided for people surveyed");
            $scope.error= "Please enter a valid number of people surveyed";
            return false;
        }
        if ($scope.product.pain78 < 0) {
            console.warn("Total for Pain rating of 7 or 8 assumed to be 0");
            $scope.error= "Number of 7-8 pain ratings must be a valid number";
            return false;
        }

        if ($scope.product.pain910 < 0) {
            console.warn("Total for Pain rating of 9 or 10 assumed to be 0");
            $scope.error= "Number of 9-10 pain ratings must be a valid number";
            return false;
        }
        if ($scope.product.benefit78 < 0) {
            console.warn("Total for Benefit rating of 7 or 8 assumed to be 0");
            $scope.error= "Number of 7-8 benefit ratings must be a valid number";
            return false;
        }

        if ($scope.product.benefit910 < 0) {
            console.warn("Total for Benefit rating of 9 or 10 assumed to be 0");
            $scope.error= "Number of 9-10 benefit ratings must be a valid number";
            return false;
        }

        if($scope.product.surveyed < $scope.product.pain78 + $scope.product.pain910){
            $scope.error="Number of surveys cannot be less than number of pain scores";
            return false;
        }
        if($scope.product.surveyed < $scope.product.benefit78 + $scope.product.benefit910){
            $scope.error="Number of surveys cannot be less than number of benefit scores";
            return false;
        }

        return true;
    };
    $scope.cancel = function () {
        $location.path("/dashboard");
    };
}]);
