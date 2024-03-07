const mongoose = require('mongoose');

const realtySchema = mongoose.Schema({

    user: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    description: String,
    area: String,
    rooms: Number,
    price: Number,
    delay: Number,
    budget : Number,
    financed: String,
    imageUrl: [String],
});

const Realty = mongoose.model('realtys', realtySchema);

module.exports = Realty;