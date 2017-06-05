'use strict';

angular.module('venturxApp.login', ['ngRoute', 'venturxApp'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/login', {
            templateUrl: 'views/login/login.html',
            controller: 'LoginCtrl'
        });
}])
    .controller('LoginCtrl', ['$scope', '$rootScope', '$location', '$http', 'SessionService', function ($scope, $rootScope, $location, $http, SessionService) {
        $scope.user = {};
        $scope.hasError = false;
        $scope.passresetpage = false;
        $scope.showlogin = true;

        var link = window.location.href;
        var point = link.indexOf("pass=");

        var isreset = false
        if (point > 0) {
            $scope.user.code = (link.substr(point + 5))
            $scope.showlogin = false;
            $scope.showreset = false;
            $scope.passresetpage = false;
            $http.post($rootScope.contextUrl + "/rest/validID", $scope.user)
                .then(
                    function (response) {
                        if (response.data === "0") {
                            $scope.showlogin = true;
                            $scope.showreset = false;
                            $scope.passresetpage = false;
                        } else {
                            $scope.user.resetemail = response.data
                            $scope.passresetpage = true;
                            isreset = true
                            console.log("valid reset key for " + response.data)
                            //now update password

                            if (isreset) {
                                $scope.resetpass = function () {
                                    if ($scope.user.newpass == $scope.user.newrepass && ($scope.user.newpass).length != 0) {
                                        $http.post($rootScope.contextUrl + "/rest/savepass", $scope.user)
                                            .then(
                                                function (response) {
                                                    if (response.data === "1") {
                                                        $scope.error = "Password reset successful";
                                                        $scope.hasError = true;
                                                        $scope.showlogin = true;
                                                        $scope.showreset = false;
                                                        $scope.passresetpage = false;
                                                    } else {
                                                        $scope.error = "Password reset failed";
                                                        $scope.hasError = true;
                                                    }
                                                })
                                    } else { //invalid password
                                        $scope.error = "Passwords do not match";
                                        $scope.hasError = true;
                                    }
                                }
                            }
                        }
                    })
        }

        $scope.openreset = function () {
            $scope.showlogin = false;
            $scope.showreset = true;
        }

        $scope.forgotpassword = function () {
            $http.post($rootScope.contextUrl + "/rest/resetPassword", $scope.user)
                .then(
                    function (response) {
                        if (response.data === "1") {
                            $scope.showlogin = true;
                            $scope.showreset = false;
                            $scope.error = "Reset email successfully send";
                            $scope.hasError = true;
                        } else {
                            $scope.error = "Error, the entered email may not be associated with any account";
                            $scope.hasError = true;
                        }
                    }
                )
        }


        $scope.login = function () {
            if ($scope.validateForm()) {
                $http.post($rootScope.contextUrl + 'rest/login', $scope.user)
                    .then(
                        function (reponse) {
                            if (reponse.data === "1") {
                                SessionService.setValue("vxsid", $scope.user.email);
                                $rootScope.email = $scope.user.email;
                                $location.path("/dashboard");
                            } else {
                                $scope.error = "The entered credentials are invalid";
                                $scope.hasError = true
                            }
                        },
                        function (error) {
                            $scope.hasError = true
                            $scope.error = "The entered credentials are invalid";
                            console.log("error: ", error);
                        }
                    );
            } else {
                $scope.error = "The entered credentials are invalid";
                $scope.hasError = true;
            }
        };

        $scope.validateForm = function () {
            if (!$scope.user.email || !$scope.user.email.includes('@') && !$scope.user.email.includes('.')) {
                $scope.error = "Please enter a valid email address";
                return false;
            }
            if (!$scope.user.password || $scope.user.password === "") {
                $scope.error = "Please enter a password";
                return false;
            }
            return true;
        };
}]);
