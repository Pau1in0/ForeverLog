import mongoose from 'mongoose';

//Schema
const LogSchema = new mongoose.Schema({
    user: {type: String, requires: true},
    title: {type: String, required: true},
    content: {type: String, required: true}
})

//Model
const Log = mongoose.model('Log', LogSchema, 'logs');

export default Log;