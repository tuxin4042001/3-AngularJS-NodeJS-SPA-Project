'use strict';

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

function describeArc(x, y, radius, percent) {
    percent = (percent >= 100 ? 99.9 : (percent < 1 ? 1 : percent));
    var endAngle = 360 * (percent / 100);

    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, 0);

    var largeArcFlag = endAngle <= 180 ? "0" : "1";

    var d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");

    return d;
}

var myApp = angular.module('venturxApp.dashboard', ['ngRoute', 'venturxApp']);
myApp.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/dashboard', {
        templateUrl: 'views/dashboard/dashboard.html',
        controller: 'DashboardCtrl'
    });
}]);

myApp.controller('DashboardCtrl', ['$scope', '$rootScope', '$location', '$http', 'SessionService', function ($scope, $rootScope, $location, $http, SessionService) {

    $rootScope.email = SessionService.getValue("vxsid");
    if ($rootScope.email === null || $rootScope.email === undefined) {
        $location.path("/login");
    }
    $scope.company = {
        companyname: "",
        market: "",
        pain: "",
        benefit: "",
        level: 1,
        status: {
            productStatus: 0,
            marketStatus: 0,
            runwayStatus: 0,
            conversionStatus: 0,
            engagementStatus: 0
        },
        email: $rootScope.email
    };
    var savemarket = function () {
        $http.post($rootScope.contextUrl + 'rest/saveMarket', $scope.company).then(function (response) {
            if (response.data) {
                $scope.hasError = false;
                loadmarket()
            } else {
                console.error("No response received from server during save operation");
                $scope.hasError = true;
            }
        }, function (error) {
            console.error("Could not save market data: ", error);
            $scope.hasError = true;
        });
    }
    var loadmarket = function () {
        $http.post($rootScope.contextUrl + 'rest/loadMarket', $scope.company).then(function (response) {
            if (response.data !== false && response.data.benefit !== undefined && response.data.benefit !== null) {
                $scope.company.benefit = response.data.benefit;
                $scope.company.pain = response.data.pain;
                $scope.company.market = response.data.market;
                $scope.company.companyname = response.data.companyname
                $scope.hasError = false;
                console.log("successfully loaded data")
            } else {
                console.log("no data exists on server")
                //no data
            }
        }, function (error) {
            console.error("Could not load market data: ", error);
            $scope.hasError = true;
        });
    }

    //NOTE: this is called again lower down...why??
    loadmarket()

    if ($scope.updateProfiledialog === undefined) {
        $scope.hideprofile = true;
        $scope.profilebutton = "Edit Profile";
        $scope.updatecompanydialog = false;
        $scope.hidecompany = true;
    }
    $scope.updateprofilebutton = function () {
        $scope.hidecompany = false;
        if ($scope.profilebutton == "Save") {
            //save profile into db here
            savemarket()
            loadmarket()
            $scope.updateProfiledialog = false;
            $scope.hideprofile = true;
            $scope.profilebutton = "Edit Profile";
            $scope.hidecompany = true;
        } else { //open save profile dialog
            $scope.updateProfiledialog = true;
            $scope.hideprofile = false;
            $scope.profilebutton = "Save";
            loadmarket()
        }
    }
    //focus on the input content, realize the placeholder function
    $scope.focus = function () {
        if ($scope.company.companyname === "your company name") {
            $scope.company.companyname = null;
        } else if ($scope.company.market === "Fill in who are your customers?") {
            $scope.company.market = null;
        } else if ($scope.company.pain === "What is the pain statement that you are trying to solve for them?") {
            $scope.company.pain = null;
        } else if ($scope.company.benefit === "What is the benefit that will match that pain statement?") {
            $scope.company.benefit = null;
        }
    }

    $scope.cancelupdate = function () { //cancel button
        $scope.updateProfiledialog = false;
        $scope.hideprofile = true;
        $scope.profilebutton = "Edit Profile";
        loadmarket()
    }

    //NOTE: this is the second time this is called...why??
    loadmarket()

    var setGauge = function (id, percent) {
        var glow = $(".glow");
        var cx = parseInt(glow.attr("cx"));
        var cy = parseInt(glow.attr("cy"));
        var radius = parseInt(glow.attr("r"));

        console.log("Setting gauge: ", id, ", ", percent);
        $("#" + id).attr("d", describeArc(cx, cy, radius, (!percent || percent == undefined ? 0 : percent)));
    }

    $scope.getScores = function () {
        $scope.getProductScore();
        $scope.getConversionScore();
        $scope.getEngagementScore();
        $scope.getRunwayScore();
        $scope.getProductSurveyed();
    };

    //get color for the chart - from green to red
    $scope.percentColors = [
        {
            pct: 0.0,
            color: {
                r: 0xff,
                g: 0x00,
                b: 0
            }
        }
        , {
            pct: 0.5,
            color: {
                r: 0xff,
                g: 0xff,
                b: 0
            }
        }
        , {
            pct: 1.0,
            color: {
                r: 0x00,
                g: 0xff,
                b: 0
            }
        }];
    $scope.getColorForPercentage = function (pct) {
        if (pct > 1) pct = 1;
        //console.log(pct + "end; ");
        for (var i = 0; i < $scope.percentColors.length; i++) {
            if (pct <= $scope.percentColors[i].pct) {
                var lower = $scope.percentColors[i - 1] || {
                    pct: 0.1,
                    color: {
                        r: 0x0,
                        g: 0x00,
                        b: 0
                    }
                };
                var upper = $scope.percentColors[i];
                var range = upper.pct - lower.pct;
                var rangePct = (pct - lower.pct) / range;
                var pctLower = 1 - rangePct;
                var pctUpper = rangePct;
                var color = {
                    r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
                    g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
                    b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
                };
                //convert rgb to hex
                color.r = parseInt(color.r).toString(16);
                color.r = (color.r.length == 1) ? "0" + color.r : color.r;
                color.g = parseInt(color.g).toString(16);
                color.g = (color.g.length == 1) ? "0" + color.g : color.g;
                color.b = parseInt(color.b).toString(16);
                color.b = (color.b.length == 1) ? "0" + color.b : color.b;
                return '#' + color.r + color.g + color.b;
            }
        }
    };
    //Count product score
    $scope.getProductScore = function () {
        var url = $rootScope.contextUrl + 'rest/loadProduct/' + $rootScope.email;
        $http({
            method: 'GET',
            url: url
        }).then(function (response) {
            if (response && response.data && response.data !== undefined) {
                $scope.productScore = parseFloat(response.data);
                setGauge("product", $scope.productScore);
                $scope.productScoreColor = $scope.getColorForPercentage($scope.productScore / 100);
                if ($scope.productScore && $scope.productScore !== "") {
                    $scope.displayHint();
                }
            } else {
                console.log("No product score returned")
            }
        }, function (error) {
            console.log("error: ", error);
        });
    };

    //Count product surveyed
    $scope.getProductSurveyed = function () {
        var url = $rootScope.contextUrl + 'rest/loadProductSurveyed/' + $rootScope.email;
        $http({
            method: 'GET'
            , url: url
        }).then(function (response) {
            if (response.data) {
                $scope.productSurveyed = parseFloat(response.data);
            }
            if ($scope.productSurveyed && $scope.productSurveyed != "") {
                $scope.displayHint();
            }
        }, function (error) {
            console.log("error: ", error);
        });
    };

    //Display hint according different condition
    $scope.displayHint = function () {
        if ($scope.productScore && $scope.productScore !== "" && $scope.productSurveyed && $scope.productSurveyed != "") {
            if ($scope.productScore < 45 && $scope.productSurveyed < 35) {
                $scope.hint = true;
                $scope.dashboardHint = "Oh no! It looks like your product market fit is low! Try doing at least 35 customer interviews within the same target market to find out if this is the right market, pain, benefit for your business!";
            } else {
                $scope.hint = false;
                $scope.dashboardHint = ""
            }

        }
    }

    //Count product score
    $scope.getRunwayScore = function () {
        var url = $rootScope.contextUrl + 'rest/loadRunway/' + $rootScope.email;
        $http({
            method: 'GET',
            url: url
        }).then(function (response) {
            if (response && response.data && response.data !== undefined) {
                if(response.data === "-1") {
                    //Runway is infinite
                    $scope.runwayPercentage = 99;
                    $scope.runwayMonths = '\u221E';
                    $scope.runwayScoreColor = $scope.getColorForPercentage(1.0);
                } else {
                    var score = parseFloat(response.data);
                    var target = 24; //Startups should ideally be able to survive for 24 months
                    var percentage = Math.min(score, target) / target;
                    $scope.runwayPercentage = Math.round(percentage * 100);
                    $scope.runwayMonths = score;
                    $scope.runwayScoreColor = $scope.getColorForPercentage(percentage);
                }

                setGauge("runway", $scope.runwayPercentage);
            } else {
                console.log("No runway score returned")
            }
        }, function (error) {
            console.log("error: ", error);
        });
    };
    //Count product score
    $scope.getConversionScore = function () {
        var url = $rootScope.contextUrl + 'rest/loadConversion/' + $rootScope.email;
        $http({
            method: 'GET',
            url: url
        }).then(function (response) {
            if (response && response.data && response.data !== undefined) {
                $scope.conversionScore = parseFloat(response.data);
                $scope.conversionScoreColor = $scope.getColorForPercentage($scope.conversionScore / 100);
                setGauge("conversion", $scope.conversionScore);
            } else {
                console.log("No conversion score returned")
            }
        }, function (error) {
            console.log("error: ", error);
        });
    };
    //Count product score
    $scope.getEngagementScore = function () {
        var url = $rootScope.contextUrl + 'rest/loadEngagement/' + $rootScope.email;
        $http({
            method: 'GET',
            url: url
        }).then(function (response) {
            if (response && response.data && response.data !== undefined) {
                $scope.engagementScore = parseFloat(response.data);
                $scope.engagementScoreColor = $scope.getColorForPercentage($scope.engagementScore / 100);
                setGauge("engagement", $scope.engagementScore);
            } else {
                console.log("No engagement score returned")
            }
        }, function (error) {
            console.log("error: ", error);
        });
    };
    $scope.getDataFromCsv = function (url) {
        var resultData = [];
        $.ajax({
            url: url,
            type: 'get',
            dataType: 'html',
            async: false,
            success: function (allText) {
                // split content based on new line
                var allTextLines = allText.split(/\r\n|\n/);
                var headers = allTextLines[0].split(',');
                var lines = [];
                if (allTextLines.length > 1) {
                    for (var i = 1; i < allTextLines.length; i++) {
                        // split content based on comma
                        var data = allTextLines[i].split(',');
                        if (data.length == headers.length) {
                            var tarr = [];
                            for (var j = 0; j < headers.length; j++) {
                                tarr.push(data[j]);
                            }
                            lines.push(tarr);
                        }
                    }
                }
                resultData = lines.slice(0);
            }
        });
        return resultData;
    };
}]);
