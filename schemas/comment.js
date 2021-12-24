
const mongoose = require("mongoose");

let schema = mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user",
        unique: true
    },
    comment: [{
        content: {
            type: String,
            // required: true
        }
    }]
})
module.exports = schema