const mongoose = require("mongoose");

/**DB connection */


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        default: null,
        required: true,
        trim: true
    },
    email: {
        type: String,
        default: null,
        required: true,
        trim: true
    },
    profile_pic: {
        type: String,
        trim: true,
        default: null
    },
    dob:{
        type: String,
        trim: true,
        default: null
    },
    password: {
        type: String,
        required: true,
    },
    deleted:{
        type:Boolean,
        default:false
    },
    timestamp : {
        type: String,  
        default: null
    }

});

const User = mongoose.model('User',userSchema);

module.exports={User}