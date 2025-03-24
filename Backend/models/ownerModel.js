import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const ownerSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    profilePicture: { type: String, default: "" },
    email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
},
    phone: {
    type: String,
    required: true,
    trim: true,
},
    properties: [
    {
        type: Schema.Types.ObjectId,
        ref: 'Property',
    },
],
});

export const Owner = model('Owner', ownerSchema);
