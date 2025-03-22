import mongoose from 'mongoose';

//Define the document schema/structure
const UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true },
    password: { 
        type: String, 
        required: true }
});

//Create a model based on the schema.  The first parameter is the password the second is the schema we are passing in.
const User = mongoose.model("User", UserSchema, "users");

export default User;