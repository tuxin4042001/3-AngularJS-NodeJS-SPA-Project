// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var SourceSchema = mongoose.Schema({
  amount      : Number,
  source      : String,
  type        : String //valid values are "monthly" and "once"
});
// define the schema for our user model
var runwaySchema = mongoose.Schema({
    email     : String,
    cash      : Number,
    revenues  : [SourceSchema],
    expenses  : [SourceSchema]
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Runway', runwaySchema);
