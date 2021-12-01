
const mongoose = require("mongoose");

let schema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    age: {
        type: Number
    },
    stories: [{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Story'
    }]
})
module.exports = schema