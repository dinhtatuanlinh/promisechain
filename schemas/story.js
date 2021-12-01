const mongoose = require("mongoose");

let schema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'person'
    }
})
module.exports = schema