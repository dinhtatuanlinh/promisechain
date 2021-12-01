const mongoose = require("mongoose");

let schema = mongoose.Schema({
    // _id:{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "comment"
    // },
    user:{
        type: String,
        required: true
    },
    commentCount: {
        type: Number,
        default: 0,
        // required: true
    },
    commentid:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "comment"
    }
})

module.exports = schema