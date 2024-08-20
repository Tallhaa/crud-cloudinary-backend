const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
    },
    cloudinary_id: {
        type: String
    }
});

// create model
const users = mongoose.model("users", userSchema);
module.exports = users;