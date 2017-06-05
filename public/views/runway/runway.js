'use strict';
angular.module('venturxApp.runway', ['ngRoute']).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/runway', {
        templateUrl: 'views/runway/runway.html'
        , controller: 'RunwayCtrl'
    });
}]).controller('RunwayCtrl', ['$scope', '$rootScope', '$location', '$http', 'SessionService', function ($scope, $rootScope, $location, $http, SessionService) {

    $rootScope.email = SessionService.getValue("vxsid");

    $scope.runway = {
        email: $rootScope.email
        , revenues: []
        , expenses: []
    };

    $scope.saveRunway = function () {
        if ($scope.validateForm()) {
            $http.post($rootScope.contextUrl + 'rest/saveRunway', $scope.runway).then(function (response) {
                if (response.data) {
                    $location.path("/dashboard");
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
    //Revenue
    $scope.addRevenue = function () {
        $scope.runway.revenues.push({
            amount: ""
            , source: ""
            , typeOfMoney: "Choose a type here"
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
    //edit revenue type dialog
    if ($scope.editRevenueDialog === undefined) {
        $scope.editRevenueDialog = true;
    }
    if ($scope.otherInputDialog === undefined) {
        $scope.otherInputDialog = false;
    }
    $scope.saveRevenueType = function (index) { //show the edit dialog
        if ($scope.runway.revenues[index].typeOfMoney == "Choose a type here") {
            $scope.runway.revenues[index].typeOfMoney == "";
            $scope.otherInputDialog = false;
        } else if ($scope.runway.revenues[index].typeOfMoney == "Other Revenue") {
            $scope.runway.revenues[index].typeOfMoney == "";
            $scope.otherInputDialog = true;
        } else {
            $scope.editRevenueDialog = false;
            $scope.displayRevenueDialog = true;
            $scope.otherInputDialog = false;
        }
    }
    $scope.updateRevenueType = function () {
        $scope.editRevenueDialog = true;
        $scope.displayRevenueDialog = false;
    }

    $scope.addExpense = function () {
        $scope.runway.expenses.push({
            amount: ""
            , source: ""
            , typeOfMoney: "Choose a type here"
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
    //edit expenses type dialog
    if ($scope.editExpenseDialog === undefined) {
        $scope.editExpenseDialog = true;
    }
    if ($scope.otherExpenseInputDialog === undefined) {
        $scope.otherExpenseInputDialog = false;
    }
    $scope.saveExpenseType = function (index) { //show the edit dialog
        if ($scope.runway.expenses[index].typeOfMoney == "Choose a type here") {
            $scope.runway.expenses[index].typeOfMoney == "";
            $scope.otherExpenseInputDialog = false;
        } else if ($scope.runway.expenses[index].typeOfMoney == "Other Expense") {
            $scope.runway.expenses[index].typeOfMoney == "";
            $scope.otherExpenseInputDialog = true;
        } else {
            $scope.editExpenseDialog = false;
            $scope.displayExpenseDialog = true;
            $scope.otherExpenseInputDialog = false;
        }
    }
    $scope.updateExpenseType = function () {
        $scope.editExpenseDialog = true;
        $scope.displayExpenseDialog = false;
    }

    $scope.validateForm = function () {
        var foundRevenue = false;
        var foundExpenses = false;

        // runway input change type from type = "text" to type = "number", don't need this verification

        // var pattern = new RegExp("^(-{0,1})[0-9,]+((.)([0-9]{1,2})){0,1}[ ,$A-Za-z]*$");
        // if ($scope.runway.cash === "" || !pattern.test($scope.runway.cash)) {
        //     $scope.error = "Please enter a valid estimate of your financial reserves (Upto two decimals)"
        //     return false
        // }
        // $scope.runway.cash = Math.abs(parseFloat($scope.runway.cash.replace(/[^0-9.]/g, "")));

        if ($scope.runway.cash === null || $scope.runway.cash === "") {
            $scope.error = "Please enter a valid estimate of your financial reserves (Upto two decimals)"
            return false
        }

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

                // if (revenue.amount === null || revenue.amount === "" || !pattern.test(revenue.amount)) {
                //     console.log("Had an issue");
                //     $scope.error = "Please enter a valid revenue amount (Upto two decimals)";
                //     return false;
                // }
                // console.log("Everything is fine");

                if (revenue.amount === null || revenue.amount === "") {
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

                // if (expense.amount == null || expense.amount === "" || !pattern.test(expense.amount)) {
                //     $scope.error = "Please enter a valid expense amount (up to two decimals)";
                //     return false;
                // }

                if (expense.amount == null || expense.amount === "") {
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
    $scope.cancel = function () {
        $location.path("/dashboard");
    };
}]);