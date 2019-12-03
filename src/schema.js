var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var UserSchema2 = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, "can't be blank"],
    match: [/\S+@\S+\.\S+/, 'is invalid'],
    index: true
  },
  following: {
    type: Array
  },
  followers: {
    type: Array
  },
  verificationKey: String,
  isVerified: Boolean
});

UserSchema2.plugin(uniqueValidator, {
  message: 'is already in use.'
});

mongoose.model('User', UserSchema2);