// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
    firstName         : String,
    lastName          : String,
    email             : String,
    password          : String,
    accelerator       : String,
    industry          : String,    
    promoCode         : String,
    agreeEmails       : Boolean,
    stripeToken       : String,
    stripeCustomerId  : String,
    stripeChargeId    : String,
    market: String,
    pain: String,
    benefit: String,
    profilepath :String,
    companyname: String,
    resetcode: Number
});

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
