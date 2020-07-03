const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let meetingSchema = new Schema({
    meetingId: {
        type: String,
        default: "",
        index: true,
        unique: true
    },
    userId: {
        type: String,
        default: ""
    },
    emailAddress: {
        type: String,
        default: ""
    },
    adminName: {
        type: String,
        default: ""
    },
    title: {
        type: String,
        default: ""
    },
    startDate: {
        type: Date,
        default: ""
    },
    endDate: {
        type: Date,
        default: ""
    },
    location: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    },
    createdOn: {
        type: Date,
        default: ""
    }

});

mongoose.model('Meeting', meetingSchema);