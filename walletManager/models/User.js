const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const A=new Schema({title:String,email:String,Amount:String,requestDate:{
  type: Date,
  default:null

}});

// create schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  acc:{type:Number,required:true},
track:{type:[A],default:null},
  loan:{
       type:[A],
      default:null,
  },

});

mongoose.model('users', UserSchema);
