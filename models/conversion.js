// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var conversionSchema = mongoose.Schema({
    email     : String,
    signedup  : Number,
    money     : Number,
    intent    : Number,
    contact   : String
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Conversion', conversionSchema);
