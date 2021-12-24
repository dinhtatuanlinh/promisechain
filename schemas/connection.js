const mongoose = require('mongoose');

const user = require('./user');
const comment = require('./comment')
const person = require('./person');
const story = require('./story')
mongoose.connect('mongodb+srv://tuanlinh:0123698745@cluster0.06xjh.mongodb.net/promise-chain?retryWrites=true&w=majority');
// mongoose.connect('mongodb://chatapp:0123698745@113.190.131.125:27017/chat-app?retryWrites=true&w=majority');
// mongodb://chatapp:0123698745@113.190.131.125:27017/chat-app?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false
const connectionDatabase = mongoose.connection;

connectionDatabase.on('error', () => { console.log('connection error') });

connectionDatabase.once('open', function() {
    // we're connected! 
    console.log('database connected');

});
module.exports = {
    userModel: mongoose.model('user', user),
    commentModel: mongoose.model('comment', comment),
    personModel: mongoose.model('person', person),
    storyModel: mongoose.model('story', story),
}