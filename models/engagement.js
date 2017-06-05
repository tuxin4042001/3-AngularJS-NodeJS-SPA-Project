// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var engagementSchema = mongoose.Schema({
    email     : String,
    surveyed  : Number,
    registered: Number,
    resigned  : Number,
    used      : Number,
    referred  : Number,
    usedw     : Number
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Engagement', engagementSchema);
