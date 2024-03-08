const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  email: String,
  username: String,
  password: String,
  delay: Number,
  financed: String,
  financialCapacity: String,
  desciption: String,
  token: String,
});

const User = mongoose.model('users', userSchema);

module.exports = User;