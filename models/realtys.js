const mongoose = require('mongoose');

const realtySchema = mongoose.Schema({

    user: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    description: String,
    price: Number,
    livingArea: Boolean,
    outdoorArea : Boolean,
    rooms: Number,
    location : String,
    terrace : Boolean,
    typeOfRealty : String,
    delay: Number,
    budget : Number,
    financed: String,
    imageUrl: [String],
    realtyId: String,
});

const Realty = mongoose.model('realtys', realtySchema);

module.exports = Realty;