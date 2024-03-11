const mongoose = require('mongoose');

const realtySchema = mongoose.Schema({

    user: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    description: String,
    price: Number,
    livingArea: Number,
    outdoorArea : Number,
    rooms: Number,
    location : String,
    terrace : Boolean,
    typeOfRealty : String,
    delay: Number,
    budget : Number,
    financed: Boolean,
    imageUrl: [String],
    realtyId: String,
    likedBy :[[{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }]]
});

const Realty = mongoose.model('realtys', realtySchema);

module.exports = Realty;