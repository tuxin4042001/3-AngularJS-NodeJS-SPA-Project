'use strict';

angular.module('venturxApp.update', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/signup2', {
            templateUrl: 'views/update/update.html',
            controller: 'UpdateCtrl'
        });
}])

    .controller('UpdateCtrl', ['$scope', '$rootScope', '$location', '$http', 'SessionService', function ($scope, $rootScope, $location, $http, SessionService) {
        SessionService.setValue("vxsid", $rootScope.registeredUser.email);    
    $rootScope.email = SessionService.getValue("vxsid");

        $scope.agreeStatement = false;

        $scope.user = {
            email: $rootScope.registeredUser.email,
            agreeEmails: true
        };

        $scope.updateUser = function () {
            $http.post($rootScope.contextUrl + 'rest/updateUser', $scope.user)
                .then(
                    function (reponse) {
                        if (reponse.data !== false) {
                            $rootScope.email = SessionService.getValue("vxsid");
                            // $location.path("/wizardForm");
                            $location.path("/dashboard");
                            //$scope.hasError = false;
                        } else {
                            console.log("Update failed: ", response);
                        }
                    },
                    function (error) {
                        console.log("Communication failure: ", error);
                    }
                );
            $scope.hasError = true;
        };

        // Stripe Response Handler
        /* Not using Stripe at the moment
        $scope.stripeCallback = function (code, result) {
            if (result.error) {
                $scope.hasError = true;
                $scope.errmsg = 'Payment failed: ' + result.error.message;
            } else {
                $scope.user.stripeToken = result.id;
                $scope.updateUser();
            }
        };
        */
}]);
