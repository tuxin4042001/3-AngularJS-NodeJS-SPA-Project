'use strict';
angular.module('venturxApp.engagement', ['ngRoute']).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/engagement', {
        templateUrl: 'views/engagement/engagement.html'
        , controller: 'EngagementCtrl'
    });
}]).controller('EngagementCtrl', ['$scope', '$rootScope', '$location', '$http', 'SessionService', function ($scope, $rootScope, $location, $http, SessionService) {
    $rootScope.email = SessionService.getValue("vxsid");
    $scope.engagement = {
        email: $rootScope.email
    };
    $scope.saveEngagement = function () {
        if ($scope.validateForm()) {
            $http.post($rootScope.contextUrl + 'rest/saveengagement', $scope.engagement).then(function (response) {
                if (response.data) {
                    $location.path("/dashboard");
                }
            }, function (error) {
                console.log("error: ", error);
            });
        }
        else {
            $scope.hasError = true;
        }
    };
    $scope.validateForm = function () {
        if ($scope.engagement.registered < 0) {
            $scope.error = "Number of customers must a valid number";
            return false;
        }
        if ($scope.engagement.resigned < 0) {
            $scope.error = "Number of sign ons must a valid number";
            return false;
        }
        if ($scope.engagement.registered < $scope.engagement.resigned) {
            $scope.error = "The number of customers cannot be less than the number of sign ons";
            return false;
        }
        if ($scope.engagement.used < 0) {
            $scope.error = "Number of users must a valid number";
            return false;
        }
        if ($scope.engagement.registered < $scope.engagement.used) {
            $scope.error = "The number of customers cannot be less than the number of users";
            return false;
        }
        if ($scope.engagement.referred < 0) {
            $scope.error = "Number of referrals must a valid number";
            return false;
        }
        if ($scope.engagement.registered < $scope.engagement.referred) {
            $scope.error = "The number of customers cannot be less than the number of referrals";
            return false;
        }
        if ($scope.engagement.usedw < 0) {
            $scope.error = "Number of twice-a-week users must a valid number";
            return false;
        }
        if ($scope.engagement.registered < $scope.engagement.usedw) {
            $scope.error = "The number of customers cannot be less than the number of twice-a-week users";
            return false;
        }
        return true;
    };
    $scope.cancel = function () {
        $location.path("/dashboard");
    };



}]);
