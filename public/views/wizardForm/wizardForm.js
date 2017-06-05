'use strict';

angular.module('venturxApp.wizardForm', ['ngRoute', 'ngAnimate', 'venturxApp']).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/wizardForm', {
        templateUrl: 'views/wizardForm/wizardForm.html',
        controller: 'wizardFormCtrl'
    });
}]).controller('wizardFormCtrl', ['$scope', '$rootScope', '$location', '$http', 'SessionService', function ($scope, $rootScope, $location, $http, SessionService) {
    //Wizard Form Switch
    var vm = this;
    vm.step = "one";
    vm.stepOne = stepOne;
    vm.stepTwo = stepTwo;
    vm.stepThree = stepThree;
    vm.stepFour = stepFour;

    function stepOne() {
        vm.step = "one";
    }

    function stepTwo() {
        vm.step = "two";
    }

    function stepThree() {
        vm.step = "three";
    }

    function stepFour() {
        vm.step = "four";
    }

    //0. Session Id
    $rootScope.email = SessionService.getValue("vxsid");

    //1.Product Submit
    $scope.product = {
        email: $rootScope.email
    };
    $scope.saveProduct = function () {
        if ($scope.validateForm1()) {
            $http.post($rootScope.contextUrl + 'rest/saveProduct', $scope.product).then(function (response) {
                if (response.data) {
                    //$location.path("/dashboard");
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
    $scope.validateForm1 = function () {
        var pattern = new RegExp("^[0-9]+$");

        if (!$scope.product.surveyed || $scope.product.surveyed === "" || !pattern.test($scope.product.surveyed)) {
            console.error("No value provided for people surveyed");
            $scope.error= "Please enter a valid number of people surveyed";
            return false;
        }
        if (!$scope.product.pain78 || $scope.product.pain78 === "" || !pattern.test($scope.product.pain78)) {
            console.warn("Total for Pain rating of 7 or 8 assumed to be 0");
            $scope.error= "Number of 7-8 pain ratings must be a valid number";
            return false;
        }

        if (!$scope.product.pain910 || $scope.product.pain910 === "" || !pattern.test($scope.product.pain910)) {
            console.warn("Total for Pain rating of 9 or 10 assumed to be 0");
            $scope.error= "Number of 9-10 pain ratings must be a valid number";
            return false;
        }
        if (!$scope.product.benefit78 || $scope.product.benefit78 === "" || !pattern.test($scope.product.benefit78)) {
            console.warn("Total for Benefit rating of 7 or 8 assumed to be 0");
            $scope.error= "Number of 7-8 benefit ratings must be a valid number";
            return false;
        }

        if (!$scope.product.benefit910 || $scope.product.benefit910 === "" || !pattern.test($scope.product.benefit910)) {
            console.warn("Total for Benefit rating of 9 or 10 assumed to be 0");
            $scope.error= "Number of 9-10 benefit ratings must be a valid number";
            return false;
        }

        if(parseInt($scope.product.surveyed)< parseInt($scope.product.pain78)+parseInt($scope.product.pain910)){
            $scope.error="Number of surveys cannot be less than number of pain scores";
            return false;
        }
        if(parseInt($scope.product.surveyed)< parseInt($scope.product.benefit78)+parseInt($scope.product.benefit910)){
            $scope.error="Number of surveys cannot be less than number of benefit scores";
            return false;
        }

        return true;
    };

    //2.Runway Submit
    $scope.runway = {
        email: $rootScope.email
        , revenues: []
        , expenses: []
    };
    $scope.saveRunway = function () {
        if ($scope.validateForm2()) {
            $http.post($rootScope.contextUrl + 'rest/saveRunway', $scope.runway).then(function (response) {
                if (response.data) {
                    //$location.path("/dashboard");
                    $scope.hasError = false;
                } else {
                    console.error("No response received from server during save operation");
                    $scope.error = "No response received from server during save operation"
                    $scope.hasError = true;
                }
            }, function (error) {
                console.error("Could not save runway data: ", error);
                $scope.error = "Could not save runway data"
                $scope.hasError = true;
            });
        } else {
            console.error("Form data did not pass validation check");
            $scope.hasError = true;
        }
    };

    $scope.addRevenue = function () {
        $scope.runway.revenues.push({
            amount: 0.0
            , source: ""
            , typeOfMoney: ""
            , type: "monthly"
        });
    };
    $scope.addRevenue();
    $scope.deleteRevenue = function (index) {
        $scope.runway.revenues.splice(index, 1);
        if ($scope.runway.revenues.length === 0) {
            $scope.addRevenue();
        }
    };
    if ($scope.hideRevenue === undefined) {
        $scope.hideRevenue = true;
    }
    $scope.updateRevenue = function () { //show the edit dialog
        $scope.updateRevenueDialog = true;
        $scope.hideRevenue = false;
    }
    $scope.saveRevenue = function () { //show the edit dialog
        $scope.updateRevenueDialog = false;
        $scope.hideRevenue = true;
    }
    $scope.addExpense = function () {
        $scope.runway.expenses.push({
            amount: 0.0
            , source: ""
            , typeOfMoney: ""
            , type: "monthly"
        });
    };
    $scope.addExpense();
    $scope.deleteExpense = function (index) {
        $scope.runway.expenses.splice(index, 1);
        if ($scope.runway.expenses.length === 0) {
            $scope.addExpense();
        }
    };
    if ($scope.hideExpense === undefined) {
        $scope.hideExpense = true;
    }
    $scope.updateExpense = function () { //show the edit dialog
        $scope.updateExpenseDialog = true;
        $scope.hideExpense = false;
    }
    $scope.saveExpense = function () { //show the edit dialog
        $scope.updateExpenseDialog = false;
        $scope.hideExpense = true;
    }
    $scope.validateForm2 = function () {
        var foundRevenue = false;
        var foundExpenses = false;

        var pattern = new RegExp("^(-{0,1})[0-9,]+((.)([0-9]{1,2})){0,1}[ ,$A-Za-z]*$");

        if ($scope.runway.cash === "" || !pattern.test($scope.runway.cash)) {
            $scope.error = "Please enter a valid estimate of your financial reserves (Upto two decimals)"
            return false
        }

        $scope.runway.cash = Math.abs(parseFloat($scope.runway.cash.replace(/[^0-9.]/g, "")));



        if (!$scope.runway.revenues || $scope.runway.revenues.length === 0) {
            console.warn("No revenue provided");
        } else {
            console.log("Revenue Array: ", $scope.runway.revenues);

            for (var i = 0; i < $scope.runway.revenues.length; i++) {
                var revenue = $scope.runway.revenues[i];

                if (!revenue || revenue === undefined) {
                    $scope.error = "Undefined revenue";
                    return false;
                }

                console.log("Revenue entry ", i, ": ", revenue);

                if (revenue.amount === null || revenue.amount === "" || !pattern.test(revenue.amount)) {
                    console.log("Had an issue");
                    $scope.error = "Please enter a valid revenue amount (Upto two decimals)";
                    return false;
                }
                console.log("Everything is fine");

                if (!revenue.type || revenue.type === "") {
                    $scope.error = "Expense type not provided";
                    return false;
                }

                console.log(typeof $scope.runway.revenues[i].amount)
                $scope.runway.revenues[i].amount = Math.abs(parseFloat($scope.runway.revenues[i].amount.toString().replace(/[^0-9.]/g, "")));
            }
            foundRevenue = true;
        }

        if (!$scope.runway.expenses || $scope.runway.expenses.length === 0) {
            console.warn("No expenses provided");
        } else {
            for (var i = 0; i < $scope.runway.expenses.length; i++) {
                var expense = $scope.runway.expenses[i];

                if (expense.amount == null || expense.amount === "" || !pattern.test(expense.amount)) {
                    $scope.error = "Please enter a valid expense amount (up to two decimals)";
                    return false;
                }

                if (!expense.type || expense.type === "") {
                    $scope.error = "Expense type not provided";
                    return false;
                }

                $scope.runway.expenses[i].amount = Math.abs(parseFloat($scope.runway.expenses[i].amount.toString().replace(/[^0-9.]/g, ""))) //remove all special chars except decimal

            }

            foundExpenses = true;
        }


        console.log("front end succeeded at taking values")

        return true;
    };

    //3.Conversion Submit
    $scope.conversion = {
        email: $rootScope.email
    };
    $scope.saveConversion = function () {
        if ($scope.validateForm3()) {
            $http.post($rootScope.contextUrl + 'rest/saveConversion', $scope.conversion).then(function (response) {
                if (response.data == "1") {
                    //$location.path("/dashboard");
                    $scope.hasError = false;
                } else if (response.data == "0") {
                    $scope.error = "Number of surveys cannot be less than number of signups, orders and intent combined"
                    $scope.hasError = true;
                }
                else if (response.data == "-2") {
                    $scope.error = "Could not retrieve number product data."
                    $scope.hasError = true;
                }
                else {

                    console.error("No response received from server during save operation");
                    $scope.error = "Server Error"
                    $scope.hasError = true;


                }
            }, function (error) {
                console.error("Could not save conversion data: ", error);
                $scope.error = "Server error"
                $scope.hasError = true;
            });
        } else {
            console.error("Form data did not pass validation check");
            $scope.hasError = true;
        }
    };
    $scope.validateForm3 = function () {
        var pattern = new RegExp("^[0-9]+$");


        if (!$scope.conversion.signedup || $scope.conversion.signedup === "" || !pattern.test($scope.conversion.signedup)) {
            $scope.error = "Number of signups must be a valid number";
            return false;
        }
        if (!$scope.conversion.money || $scope.conversion.money === "" || !pattern.test($scope.conversion.money)) {
            $scope.error = "Number of preorders must be a valid number";
            return false;
        }
        if (!$scope.conversion.intent || $scope.conversion.intent === "" || !pattern.test($scope.conversion.intent)) {
            $scope.error = "Letter of intent must be a valid whole number";
            return false
        }



        if ($scope.conversion.signedup === 0 &&
            $scope.conversion.money === 0 &&
            $scope.conversion.intent === 0) {
            console.error("All form data is either zero or empty");
            $scope.error = "All fields cannot be zero";
            return false;
        }

        return true;
    };

    //4.Engagement Submit
    $scope.engagement = {
        email: $rootScope.email
    };
    $scope.saveEngagement = function () {
        if ($scope.validateForm4()) {
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
    $scope.validateForm4 = function () {
        var pattern = new RegExp("^[0-9]+$")
        if (!$scope.engagement.registered || $scope.engagement.registered === "" || !pattern.test($scope.engagement.registered)) {
            $scope.error = "Number of customers must a valid number";
            return false;
        }
        if (!$scope.engagement.resigned || $scope.engagement.resigned === "" || !pattern.test($scope.engagement.resigned)) {
            $scope.error = "Number of sign ons must a valid number";
            return false;
        }
        if (parseInt($scope.engagement.registered) < parseInt($scope.engagement.resigned)) {
            $scope.error = "The number of customers cannot be less than the number of sign ons";
            return false;
        }
        if (!$scope.engagement.used || $scope.engagement.used === "" || !pattern.test($scope.engagement.used)) {
            $scope.error = "Number of users must a valid number";
            return false;
        }
        if (parseInt($scope.engagement.registered) < parseInt($scope.engagement.used)) {
            $scope.error = "The number of customers cannot be less than the number of users";
            return false;
        }
        if (!$scope.engagement.referred || $scope.engagement.referred === "" || !pattern.test($scope.engagement.referred)) {
            $scope.error = "Number of referrals must a valid number";
            return false;
        }
        if (parseInt($scope.engagement.registered) < parseInt($scope.engagement.referred)) {
            $scope.error = "The number of customers cannot be less than the number of referrals";
            return false;
        }
        if (!$scope.engagement.usedw || $scope.engagement.usedw === "" || !pattern.test($scope.engagement.usedw)) {
            $scope.error = "Number of twice-a-week users must a valid number";
            return false;
        }
        if (parseInt($scope.engagement.registered) < parseInt($scope.engagement.usedw)) {
            $scope.error = "The number of customers cannot be less than the number of twice-a-week users";
            return false;
        }
        return true;
    };
}]);





