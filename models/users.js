const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  email: String,
  username: String,
  selectedImage: String,
  password: String,
  delay: Number,
  financed: Boolean,
  budget: Number,
  description: String,
  token: String,
  likedBy :[{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }]
});

const User = mongoose.model('users', userSchema);

module.exports = User;