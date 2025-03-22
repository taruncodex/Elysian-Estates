import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        sponsored: { type: Boolean },
        propertyType: {
            type: String,
            enum: ["Residential", "Commercial", "Industrial"],
            required: true
        },
        residenceType: {
            type: String,
            enum: ["Independent House", "Villa", "Flat"],
            required: true
        },
        configuration: {
            type: String,
            enum: ["1BHK", "2BHK", "3BHK", "4BHK", "Studio Apartment"],
            required: true
        },
        location: {
            city: { type: String, required: true },
            state: { type: String, required: true },
            zipCode: { type: String, required: true },
            coordinates: {
                latitude: { type: Number, required: true },
                longitude: { type: Number, required: true }
            }
        },
        areaSqFt: { type: Number, required: true },
        floor: { type: String, required: true },
        landType: {
            type: String,
            enum: ["plots", "developed land"],
            required: true
        },
        bedrooms: { type: Number, required: true },
        bathrooms: { type: Number, required: true },
        amenities: { type: [String], default: [] },
        images: { type: [String], default: [] },
        videoTour: { type: String, default: null },
        floorPlan: { type: String, default: null },
        listedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Owner", required: true },
        status: {
            type: String,
            enum: ["available", "sold", "rented", "under Construction"],
            required: true
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    },
    {
        timestamps: true
    }
);

const Property = mongoose.model("Property", propertySchema);

export default Property;
