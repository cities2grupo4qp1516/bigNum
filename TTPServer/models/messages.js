var mongoose = require('mongoose')
    , Schema = mongoose.Schema;

var messages = new Schema({
    from: {
        type: String
    }
    , to: {
        type: String
    }
    , leido: {
        type: Boolean
    }
});

module.exports = mongoose.model('messages', messages);