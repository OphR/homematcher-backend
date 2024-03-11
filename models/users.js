const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  email: String,
  username: String,
  password: String,
  delay: Number,
  financed: Boolean,
  financialCapacity: String,
  description: String,
  token: String,
  likedBy :[[{ type: mongoose.Schema.Types.ObjectId, ref: 'realtys' }]]
});

const User = mongoose.model('users', userSchema);

module.exports = User;