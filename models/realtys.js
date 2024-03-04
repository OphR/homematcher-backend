const mongoose = require('mongoose');

const realtySchema = mongoose.Schema({

    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    description: String,
    location: String,
    numberOfRooms: Number,
    price: Number,
    landArea : Number,
    livingArea : Number,
    propertyType : String,
    terrace : Boolean,
});

const Realty = mongoose.model('realtys', realtySchema);

module.exports = Realty;