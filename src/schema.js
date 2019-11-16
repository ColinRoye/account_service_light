var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var UserSchema = new mongoose.Schema({
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
          unique: true, required: [true, "can't be blank"],
          match: [/\S+@\S+\.\S+/, 'is invalid'],
          index: true
     },
     verificationKey: String,
     isVerified: Boolean
});

UserSchema.plugin(uniqueValidator, {message: 'is already in use.'});

mongoose.model('User', UserSchema);
