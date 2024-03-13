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
  likedBy :[{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
  notifications: [{ 
    action: String, // (ex: 'realtyLike', 'profileLike')
    realtyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Realty' }, 
    email: String, 
    notificationMessage: String 
}]
});

const User = mongoose.model('users', userSchema);

module.exports = User;