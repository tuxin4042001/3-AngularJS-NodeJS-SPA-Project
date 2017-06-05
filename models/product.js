// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var productSchema = mongoose.Schema({
    email     : String,
    surveyed  : Number,
    pain78    : Number,
    pain910   : Number,
    benefit78 : Number,
    benefit910: Number
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Product', productSchema);
