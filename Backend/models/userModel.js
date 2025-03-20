import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    name: { type: String, required: true, trim: true },
    profilePicture: { type: String, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, },
    phone: { type: Number, required: true, unique: true, trim: true, minlength: [10, 'Phone number should be at least 10 characters'], maxlength: [10, 'Phone number should not exceed 10 characters'] },
    resetToken: { type: String, default: null },
});

// Create the User model 
export const User = new model("User", userSchema);



