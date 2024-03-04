const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  email: String,
  username: String,
  password: String,
  firstname: String,
  lastname: String,
  age: Number,
  prosituation: String,
  financialCapacity: Number,
  desciption: String,
  token: String,
});

const User = mongoose.model('users', userSchema);

module.exports = User;