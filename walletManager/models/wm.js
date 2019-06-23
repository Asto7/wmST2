const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// create schema
const wmSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  },
  creationDate: {
    type: Date,
    default: Date.now
  },
  Amount: {
    type: String,
    required:true
  },


});

mongoose.model('WM', wmSchema);
