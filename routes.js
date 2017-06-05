//Set up logging
var winston = require('winston');
var multer = require('multer');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('2Nb0xSNqVDBamKE0rnSN6w');

var UserMgr = require("./modules/UserMgr.js")


// Register all URL handlers (routes)
module.exports = function (app) {
    // load up models
    var User = require('./models/user');
    var Product = require('./models/product');
    var Conversion = require('./models/conversion');
    var Engagement = require('./models/engagement');
    var Runway = require('./models/runway');


    app.post('/rest/validID', function (req, res) {
        var query = {
            resetcode: req.body.code
        };

        User.findOne(query, function (err, user) {
            if (!err && user && user !== undefined)
                res.send(user.email)
            else {
                res.send('0')
            }
        })
    });

    app.post('/rest/savepass', function (req, res) {
        var query = {
            email: req.body.resetemail,
            resetcode: req.body.code
        };

        User.findOne(query, function (err, user) {
            if (!err && user && user !== undefined) {

                user.password = req.body.newpass
                user.resetcode = new Date().valueOf() + Math.random();
                user.save(function (err) {
                    if (err) {
                        console.log("could not save new pass")
                    }

                });

                console.log("Saved password")
                res.send('1')
            } else {
                console.log("couldn't save password")
                res.send('0')
            }
        })

    })


    app.post('/rest/resetPassword', function (req, res) {
        var query = {
            email: req.body.resetemail
        };
        var code = new Date().valueOf() + Math.random();
        User.findOne(query, function (err, user) {
            if (!err && user && user !== undefined) {
                user.resetcode = code
                user.save(function (err) {
                    if (err) {
                        console.log("could not save")
                    }
                });

                var template_name = "Reset Password";
                var template_content = [{
                    "name": "resetlink",
                    "content": "Reset Password"
                }];

                var message = {
                    "html": "",
                    "text": "",
                    "subject": "Reset Password",
                    "from_email": "resetpass@venturx.ca",
                    "from_name": "VenturX",
                    "to": [{
                        "email": req.body.resetemail,
                        "name": "Customer",
                        "type": "to"
                    }],

                    "important": true,
                    "track_opens": null,
                    "track_clicks": null,
                    "auto_text": null,
                    "auto_html": null,
                    "inline_css": null,
                    "url_strip_qs": null,
                    "preserve_recipients": null,
                    "view_content_link": null,

                    "tracking_domain": null,
                    "signing_domain": null,
                    "return_path_domain": null,
                    "merge": true,
                    "merge_language": "mailchimp",
                    "global_merge_vars": [{
                        "name": "RESETLINK",
                        "content": req.protocol + '://' + req.get('host') + "/#/login?pass=" + code.toString()
                    }],
                    "tags": ["password-reset"],
                    "subaccount": "passreset",
                };

                var async = false;
                var ip_pool = "Main Pool";
                mandrill_client.messages.sendTemplate({
                    "template_name": template_name,
                    "template_content": template_content,
                    "message": message,
                    "async": async,
                    "ip_pool": ip_pool
                }, function (result) {
                    console.log(result);
                    res.send("1")
                }, function (e) {
                    // Mandrill returns the error as an object with name and message keys
                    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
                    console.log("failure2")
                    res.send("0")
                });
            } else {
                res.send("0")
            }
        })
    })

    //set market pain and benefit
    app.post('/rest/saveMarket', UserMgr.checkLoginStatus, function (req, res) {
        if (!req.body.email || req.body.email === "") {
            winston.error("Could not add market data - No user ID specified");
            res.send(false);
            return;
        }

        var query = {
            email: req.body.email
        };

        User.findOne(query, function (err, user) {
            if (!err && user && user !== undefined) {
                user.market = req.body.market;
                user.pain = req.body.pain;
                user.benefit = req.body.benefit;
                user.companyname = req.body.companyname;
                user.industry = req.body.industry;
                user.save(function (err) {
                    if (err) {
                        winston.error("Failed to update user's market details [", user.email, "] - ", err);
                        res.send(false);
                    } else {
                        winston.info("User's market updated [", user.email, "]");
                        res.send(true);
                    }
                });
            } else {
                winston.error("Could not find user for updating market [", req.body.email, "] - ", err);
                res.send(false);
            }
        });
    });



    app.post('/rest/loadMarket', UserMgr.checkLoginStatus, function (req, res) {
        if (!req.body.email || req.body.email === "") {
            winston.error("Could not load market data - No user ID specified");
            res.send(false);
            return;
        }
        var query = {
            email: req.body.email
        };

        User.findOne(query, function (err, user) {
            if (!err && user && user !== undefined) {

                winston.log(user.market, user.pain, user.benefit, user.industry);

                res.send({
                    market: user.market,
                    pain: user.pain,
                    benefit: user.benefit,
                    companyname: user.companyname,
                    industry: user.industry
                })

                return;
            } else {
                winston.error("Could not find user for updating market [", req.body.email, "] - ", err);
                res.send(false);
                return
            }
        });
    })

    // post the request for creating a user
    app.post('/rest/register', function (req, res) {
        winston.info("Registering new user - ", req.body);
        var query = {
            email: req.body.email
        };
        User.findOne(query, function (err, user) {
            if (err || !user || user === undefined) {
                var user = new User(req.body);
                user.save(function (err) {
                    if (err) {
                        winston.error("Failed to save user [", user.email, "] - ", err);
                        res.send("0");
                    } else {
                        req.session.user = user;

                        winston.info("User created [", user.email, "]");
                        res.send("1");
                    }
                });
            } else {
                winston.warn("User already exists");
                res.send("-1");
            }
        });
    });
    // post the request for updating a user
    app.post('/rest/updateUser', function (req, res) {
        winston.info("Updating user - ", req.body);
        var query = {
            email: req.body.email
        };
        User.findOne(query, function (err, user) {
            if (!err && user && user !== undefined) {
                user.accelerator = req.body.accelerator;
                user.industry = req.body.industry;
                user.promoCode = req.body.promoCode;
                user.subscription = req.body.subscription;
                user.agreeEmails = req.body.agreeEmails;
                user.save(function (err) {
                    if (err) {
                        winston.error("Failed to update user [", user.email, "] - ", err);
                        res.send(false);
                    } else {
                        winston.info("User updated [", user.email, "]");
                        res.send(true);
                    }
                });
            } else {
                winston.error("Could not find user for update [", req.body.email, "] - ", err);
                res.send(false);
            }
        });
    });
    // post the request for login
    app.post('/rest/login', function (req, res) {
        winston.info("User authentication - ", req.body.email);
        var query = {
            email: req.body.email,
            password: req.body.password
        };
        User.findOne(query, function (err, user) {
            if (err || !user || user === undefined) {
                winston.warn("Could not find user with matching credentials [", req.body.email, "] - ", err);
                res.send("0"); //false
            } else {
                req.session.user = user;
                winston.info("User authenticated [", req.body.email, "]");
                res.send("1"); //true
            }
        });
    });
    // post the request for add to product
    app.post('/rest/saveProduct', UserMgr.checkLoginStatus, function (req, res) {
        winston.info("Adding product data - ", req.body);
        if (!req.body.email || req.body.email === "") {
            winston.error("Could not add product data - No user ID specified");
            res.send(false);
            return;
        }
        var product = new Product(req.body);
        product.save(function (err) {
            if (err) {
                winston.error("Could not update product data [", req.body.email, "] - ", err);
                res.send(false);
            } else {
                winston.info("Product data added [", req.body.email, "]");
                res.send(true);
            }
        });
    });
    var calculateProduct = function (productData) {
        winston.debug("Calculating product score...");
        if (!productData || productData === undefined || productData.length === 0) {
            winston.debug("No data provided to calculate product score");
            return (0);
        }
        var painScore = 0,
            benefitScore = 0,
            painSurvey = 0,
            benefitSurvey = 0;
        for (var i = 0; i < productData.length; i++) {
            winston.debug("Processing product data...");
            winston.debug("   surveyed: ", productData[i].surveyed);
            winston.debug("   pain78: ", productData[i].pain78);
            winston.debug("   pain910: ", productData[i].pain910);
            winston.debug("   benefit78: ", productData[i].benefit78);
            winston.debug("   benefit910: ", productData[i].benefit910);
            var surveyed = parseInt(productData[i].surveyed);
            if (isNaN(surveyed) || surveyed === 0) {
                //skip over any data where the # of people surveyed is 0
                winston.debug("Iteration data was corrupted - skipping this iteration");
                continue;
            }
            //count pain score
            painSurvey += surveyed;
            painScore += parseInt(productData[i].pain910);
            painScore += parseInt(productData[i].pain78) / 2;
            /* Commenting out until we can fix the UI

            //determine how many promoters there were in the survey
            var painPromoter = parseInt(productData[i].pain910) + parseInt(productData[i].pain78);
            var benefitPromoter = parseInt(productData[i].benefit910) + parseInt(productData[i].benefit78)

            //Normally, the benefit statement should only have been tested against people who were promoters of the pain. However, the user might have ignored that rule
            benefitSurvey += (benefitPromoter > painPromoter ? surveyed : painPromoter);

            */
            benefitSurvey += surveyed;
            benefitScore += parseInt(productData[i].benefit910);
            benefitScore += parseInt(productData[i].benefit78) / 2;
        }
        winston.debug("Product intermediate score...");
        winston.debug("   painSurvey: ", painSurvey);
        winston.debug("   painScore: ", painScore);
        winston.debug("   benefitSurvey: ", benefitSurvey);
        winston.debug("   benefitScore: ", benefitScore);
        //bonus for the number of people surveyed about the pain
        painScore += painSurvey > 99 ? 6 : painSurvey > 69 && painSurvey <= 99 ? 3 : painSurvey > 39 && painSurvey <= 69 ? 2 : painSurvey > 19 && painSurvey <= 39 ? 1 : 0;
        winston.debug("Pain score w/ bonus: ", painScore);
        painScore = (painSurvey < painScore ? painSurvey : painScore);
        benefitScore = (benefitSurvey < benefitScore ? benefitSurvey : benefitScore);
        painScore /= painSurvey;
        benefitScore /= benefitSurvey;
        winston.debug("Adjusted scores: pain [", painScore, "] benefit [", benefitScore, "]");
        var result = Math.round(((painScore + benefitScore) / 2) * 100);
        winston.debug("Product score: ", result);
        return isNaN(result) ? 0 : (result > 100 ? 100 : result);
    };
    // get the request for load products

    app.get('/rest/currentuser', UserMgr.checkLoginStatus, function (req, res) {
        User.findOne({
            email: req.session.user.email
        }, function (err, user) {
            res.send(user.email)
        });
    })

    app.get('/rest/loadProduct/:email', UserMgr.checkLoginStatus, function (req, res) {
        winston.debug("Getting product data - ", req.params.email);
        if (!req.params.email || req.params.email === "") {
            winston.error("Could not retrieve product data - No user ID specified");
            res.send("0");
            return;
        }
        var query = {
            email: req.params.email
        };
        Product.find(query, function (err, data) {
            if (err || !data || data === undefined) {
                winston.error("Could not retrieve product data [", req.params.email, "] - ", err);
                res.send("0");
            } else {
                winston.debug("Product data found [", req.params.email, "]");
                res.send(calculateProduct(data) + "");
            }
        });
    });
    // post the request for add to conversion
    app.post('/rest/saveConversion', UserMgr.checkLoginStatus, function (req, res) {
        winston.info("Adding conversion data - ", req.body);
        if (!req.body.email || req.body.email === "") {
            winston.error("Could not add conversion data - No user ID specified");
            res.send("-1");
            return;
        }
        var userEmail = req.body.email;
        Product.find({
            email: userEmail
        }, function (err, productData) {
            if (err || !productData || productData === undefined || productData.length === 0) {
                winston.error("Could not retrieve number of people surveyed [", userEmail, "] - ", err);
                res.send("-2");
                return
            } else {
                var surveyed = 0
                for (var i = 0; i < productData.length; i++) {
                    surveyed += parseInt(productData[i].surveyed) === 0 ? 1 : parseInt(productData[i].surveyed);
                }
                //surveyed has the value
                //check if surveyed < num conversions
                var signedup = parseInt(req.body.signedup);
                var money = parseInt(req.body.money);
                var intent = parseInt(req.body.intent);
                Conversion.find({
                    email: userEmail
                }, function (err, productData) {
                    if (err || !productData || productData === undefined || productData.length === 0) {
                        winston.error("No old data exists for conversion [", userEmail, "] - ", err);
                    } else {
                        winston.debug("Old conversion data found, adding");
                        winston.debug("Old data=", signedup, money, intent);
                        for (var i = 0; i < productData.length; i++) {
                            signedup = signedup + parseInt(productData[i].signedup);
                            money = money + parseInt(productData[i].money);
                            intent = intent + parseInt(productData[i].intent);
                        }
                        winston.debug("New data=", signedup, money, intent);
                    }
                    winston.debug("comparison data=", signedup, money, intent);
                    if (surveyed < signedup + money + intent) {
                        winston.error("surveyed less than conversion [", userEmail, "] - ", err);
                        res.send("0")
                        return
                    }
                    var conversion = new Conversion(req.body);
                    conversion.save(function (err) {
                        if (err) {
                            winston.error("Could not save conversion data [", req.body.email, "] - ", err);
                            res.send("-1");
                            return
                        } else {
                            winston.info("Conversion data added [", req.body.email, "]");
                            res.send("1");
                            return
                        }
                    });
                });
            }
        })
    });
    var calculateConversion = function (conversionData, peopleSurveyed) {
        winston.debug("Calculating conversion...");
        winston.debug("People surveyed: ", peopleSurveyed);
        if (!conversionData || conversionData === undefined || conversionData.length === 0) {
            winston.debug("No conversion data for calculation");
            return (0);
        }
        if (peopleSurveyed === 0) {
            //If no-one was surveyed, all of the calculations will come out to zero anyway
            return (0);
        }
        var scoreSignedup = 1,
            scoreLetter = 2,
            scorePreorder = 4,
            bonusThreshold = 19,
            bonus = 1,
            result = 0;
        for (var i = 0; i < conversionData.length; i++) {
            winston.debug("Processing conversion data...");
            winston.debug("   SignedUp: ", conversionData[i].signedup);
            winston.debug("   Intent: ", conversionData[i].intent);
            winston.debug("   Preorder: ", conversionData[i].money);
            var tmp = 0;
            tmp += parseInt(conversionData[i].signedup) * scoreSignedup;
            tmp += parseInt(conversionData[i].intent) * scoreLetter;
            tmp += parseInt(conversionData[i].money) * scorePreorder;
            winston.debug("Iteration score: ", tmp);
            if (isNaN(tmp)) {
                winston.debug("Iteration data was corrupted - skipping this iteration");
                continue;
            }
            result += tmp;
        }
        result += peopleSurveyed >= bonusThreshold ? bonus : 0;
        result /= peopleSurveyed * 3;
        result = Math.round(result * 100);
        winston.debug("Conversion score: ", result);
        return isNaN(result) ? 0 : (result > 100 ? 100 : result);
    };
    // get the request for load products
    app.get('/rest/loadConversion/:email', UserMgr.checkLoginStatus, function (req, res) {
        var userEmail = req.params.email;
        winston.debug("Getting conversion data - ", userEmail);
        if (!userEmail || userEmail === undefined || userEmail === "") {
            winston.error("Could not retrieve conversion data - No user ID specified");
            res.send("0");
            return;
        }
        Conversion.find({
            email: userEmail
        }, function (err, conversionData) {
            if (err || !conversionData || conversionData === undefined) {
                winston.error("Could not retrieve conversion data [", req.params.email, "] - ", err);
                res.send("0");
            } else {
                winston.debug("Conversion data found [", req.params.email, "]");
                Product.find({
                    email: userEmail
                }, function (err, productData) {
                    if (err || !productData || productData === undefined || productData.length === 0) {
                        winston.error("Could not retrieve number of people surveyed [", userEmail, "] - ", err);
                        res.send("0");
                    } else {
                        var surveyed = 0
                        for (var i = 0; i < productData.length; i++) {
                            surveyed += parseInt(productData[i].surveyed) === 0 ? 1 : parseInt(productData[i].surveyed);
                        }
                        res.send(calculateConversion(conversionData, surveyed) + "");
                    }
                });
            }
        });
    });
    // post the request for add to engagement
    app.post('/rest/saveEngagement', UserMgr.checkLoginStatus, function (req, res) {
        winston.info("Adding engagement data - ", req.body);
        if (!req.body.email || req.body.email === "") {
            winston.error("Could not add engagement data - No user ID specified");
            res.send(false);
            return;
        }
        var engagement = new Engagement(req.body);
        engagement.save(function (err) {
            if (err) {
                winston.error("Could not save engagement data [", req.body.email, "] - ", err);
                res.send(false);
            } else {
                winston.info("Engagement data added [", req.body.email, "]");
                res.send(true);
            }
        });
    });
    var calculateEngagement = function (engagementData) {
        if (!engagementData || engagementData === undefined || engagementData.length === 0) {
            return (0);
        }
        var scoreResigned = 2; //signed in more than once
        var scoreUseProduct = 3; //used the product (uploaded scores, etc)
        var scoreReferred = 4; //recommended the product to a friend
        var thresholdRegistered = 19; //number of users the product needs to have in order to earn a bonus
        var bonusRegistered = 1; //bonus value for registering lots of friends
        var bonusLoyalty = 1; //bonus value for regular use of the product
        var engagement = engagementData[engagementData.length - 1];
        var regularity = parseInt(engagement.usedw);
        var registered = parseInt(engagement.registered);
        var result = 0;
        result += parseInt(engagement.resigned) * scoreResigned;
        result += parseInt(engagement.used) * scoreUseProduct;
        result += parseInt(engagement.referred) * scoreReferred;
        result += registered > thresholdRegistered ? bonusRegistered : 0;
        result += regularity > 0 ? regularity * bonusLoyalty : 0;
        result = result / (result > registered * 3 ? result : registered * 3);
        result = Math.round(result * 100);
        return isNaN(result) ? 0 : (result > 100 ? 100 : result);
    };
    // get the request for load products
    app.get('/rest/loadEngagement/:email', UserMgr.checkLoginStatus, function (req, res) {
        winston.debug("Getting engagement data - ", req.params.email);
        if (!req.params.email || req.params.email === "") {
            winston.error("Could not retrieve engagement data - No user ID specified");
            res.send("0");
            return;
        }
        var query = {
            email: req.params.email
        };
        Engagement.find(query, function (err, data) {
            if (err || !data || data === undefined) {
                winston.error("Could not retrieve engagement data [", req.params.email, "] - ", err);
                res.send("0");
            } else {
                winston.debug("Engagement data found [", req.params.email, "]");
                res.send(calculateEngagement(data) + "");
            }
        });
    });
    // post the request for add to runway
    app.post('/rest/saveRunway', UserMgr.checkLoginStatus, function (req, res) {
        winston.info("Adding runway data - ", req.body);
        if (!req.body.email || req.body.email === "") {
            winston.error("Could not add runway data - No user ID specified");
            res.send(false);
            return;
        }
        var runway = new Runway(req.body);
        runway.save(function (err) {
            if (err) {
                winston.error("Could not save runway data [", req.body.email, "] - ", err);
                res.send(false);
            } else {
                winston.info("Runway data added [", req.body.email, "]");
                res.send(true);
            }
        });
    });
    var calculateRunway = function (runwayData) {
        winston.debug("Calculating runway score...");
        if (!runwayData || runwayData === undefined || runwayData.length === 0) {
            winston.debug("No runway data for calculation");
            return (0);
        }

        var runway = runwayData[runwayData.length - 1];
        var monthlyRevenue = 0;
        var onceRevenue = 0;
        var monthlyExpenses = 0;
        var onceExpenses = 0;
        var cashReserves = parseInt(runway.cash);

        for (var j = 0; j < runway.revenues.length; j++) {
            winston.debug("   Revenue type: ", runway.revenues[j].type);
            if (runway.revenues[j].type === "monthly") {
                winston.debug("   Monthly revenue: ", runway.revenues[j].amount);
                monthlyRevenue += parseInt(runway.revenues[j].amount);
            } else {
                winston.debug("   One-time revenue: ", runway.revenues[j].amount);
                onceRevenue += parseInt(runway.revenues[j].amount);
            }
        }
        for (var k = 0; k < runway.expenses.length; k++) {
            winston.debug("   Expense type: ", runway.expenses[k].type);
            if (runway.expenses[k].type === "monthly") {
                winston.debug("   Monthly expense: ", runway.expenses[k].amount);
                monthlyExpenses += parseInt(runway.expenses[k].amount);
            } else {
                winston.debug("   One-time expense: ", runway.expenses[k].amount);
                onceExpenses += parseInt(runway.expenses[k].amount);
            }
        }

        var monthsRemaining = (monthlyRevenue >= monthlyExpenses ? -1 : (cashReserves + onceRevenue - onceExpenses) / (monthlyExpenses - monthlyRevenue));
        winston.debug("Runway score: ", monthsRemaining, " months");
        return Math.round(monthsRemaining);
    };

    // get the request for load products
    app.get('/rest/loadRunway/:email', UserMgr.checkLoginStatus, function (req, res) {
        winston.debug("Getting runway data - ", req.params.email);
        if (!req.params.email || req.params.email === "") {
            winston.error("Could not retrieve runway data - No user ID specified");
            res.send("0");
            return;
        }
        var query = {
            email: req.params.email
        };
        Runway.find(query, function (err, data) {
            if (err || !data || data === undefined) {
                winston.error("Could not retrieve runway data [", req.params.email, "] - ", err);
                res.send("0");
            } else {
                winston.debug("Runway data found [", req.params.email, "]");
                res.send(calculateRunway(data) + "");
            }
        });
    });

    // get the request for products.surveyed
    app.get('/rest/loadProductSurveyed/:email', UserMgr.checkLoginStatus, function (req, res) {
        winston.debug("Getting productSurveyed data - ", req.params.email);
        if (!req.params.email || req.params.email === "") {
            winston.error("Could not retrieve productSurveyed data - No user ID specified");
            res.send("0");
            return;
        }
        var query = {
            email: req.params.email
        };
        Product.find(query, function (err, data) {
            if (err || !data || data === undefined) {
                winston.error("Could not retrieve productSurveyed data [", req.params.email, "] - ", err);
                res.send("0");
            } else {
                winston.debug("ProductSurveyed data found [", req.params.email, "]");
                res.send(calculateProductSurveyed(data) + "");
            }
        });
    });

    var calculateProductSurveyed = function (productSurveyedData) {
        winston.debug("Calculating product surveyed number...");
        if (!productSurveyedData || productSurveyedData === undefined || productSurveyedData.length === 0) {
            winston.debug("No data provided to calculate product surveyed");
            return (0);
        }
        var productSurveyed = 0;

        for (var i = 0; i < productSurveyedData.length; i++) {
            winston.debug("Processing product surveyed data...");
            winston.debug("   surveyed: ", productSurveyedData[i].surveyed);
            var surveyed = parseInt(productSurveyedData[i].surveyed);
            if (isNaN(surveyed) || surveyed === 0) {
                //skip over any data where the # of people surveyed is 0
                winston.debug("Iteration data was corrupted - skipping this iteration");
                continue;
            }
            //count product score
            productSurveyed += surveyed;
        }
        winston.debug("Product Surveyed intermediate number...");
        winston.debug("   product survey: ", productSurveyed);

        return isNaN(productSurveyed) ? 0 : productSurveyed;
    };
};
