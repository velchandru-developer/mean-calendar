const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userSchema = new Schema({
    userId: {
        type: String,
        default: "",
        index: true,
        unique: true
    },
    firstName: {
        type: String,
        default: ""
    },
    lastName: {
        type: String,
        default: ""
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    userName: {
        type: String,
        default: ""
    },
    emailAddress: {
        type: String,
        default: ""
    },
    password: {
        type: String,
        default: "agsag"
    },
    countryCode: {
        type: String,
        default: ""
    },
    mobileNumber: {
        type: Number,
        default: ""
    },
    createdOn: {
        type: Date,
        default: ""
    }

});

mongoose.model('User', userSchema);