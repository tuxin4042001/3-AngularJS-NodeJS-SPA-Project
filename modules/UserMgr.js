var UserMgr = function () { };
var User = require('../models/user');

UserMgr.prototype.checkLoginStatus = function (req, res, next) {
    if (req.session && req.session !== undefined && req.session.user && req.session.user !== undefined) { // Check if session exists
        // lookup the user in the DB by pulling their email from the session
        User.findOne({
            email: req.session.user.email
        }, function (err, user) {
            if (err || !user || user === undefined) {
                // if the user isn't found in the DB, reset the session info and
                // redirect the user to the login page
                req.session.reset();
                res.redirect("/login");
            }
            else {
                return(next());
            }
        });
    }
    else {
        // if the session is no good, redirect to the login page
        res.redirect("/login");
    }
}
module.exports = new UserMgr();
