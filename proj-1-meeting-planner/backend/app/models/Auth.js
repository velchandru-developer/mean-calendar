const mongoose = require('mongoose');
const time = require('../libs/timeLib');

const Schema = mongoose.Schema;

let authSchema = new Schema({
    userId: {
        type: String
    },
    authToken: {
        type: String
    },
    tokenSecret: {
        type: String
    },
    tokenGenerationTime: {
        type: Date,
        default: time.now()
    }
});

mongoose.model('Authorize', authSchema);