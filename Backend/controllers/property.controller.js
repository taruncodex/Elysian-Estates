import { User } from "../models/userModel.js";

export const searchSuggestion = async (req, res) => {
    try {
        // GET /api/search/suggestions?query=city 
        const { query } = req.query;

        if (!query || query.length < 2) {
            return res.status(400).json({ message: "Query must be at least 2 characters" });
        }

        // Step 1: Find distinct city names that match the search term
        const cities = await Property.distinct("location.city", {
            "location.city": { $regex: query, $options: "i" } // Case-insensitive search
        });

        return res.status(200).json({ cities });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error.", error: error.message });
    }
}


export const searchResult = async (req, res) => {
    try {

        const { city } = req.query;

        if (!city) {
            return res.status(400).json({ message: "City is required for search" });
        }

        const properties = await Property.find({ "location.city": city });

        return res.status(200).json({ properties });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });;
    }
}


export const getFavorites = async (req, res) => {
    try {

        // Step 1: Get the authenticated user
        const user = req.user;

        // Step 2: Populate favorite properties using Property model
        const favoriteProperties = await user.populate({
            path: "favorite",
            model: "Property"
        });

        // Step 3: Return the favorite properties
        res.status(200).json({ favorites: favoriteProperties.favorite });
    } catch (error) {

        return res.status(500).json({ message: "Internal Server Error.", error: error.message });
    }
}

export const addFavorites = async (req, res) => {
    try {
        // Step 1: Get the propertyId from request body
        // Step 2: Get the user from req.user (after authentication)
        // Step 3: Check if the property is already in the favorites
        // Step 4: If already present, remove it
        // Step 5: If not present, add it to favorites
        // Step 6: Save the updated user record

        const { propertyId } = req.body;
        console.log("Property ID:", propertyId);

        const user = req.user;

        const alreadyInFavorites = user.favorite.includes(propertyId);

        if (alreadyInFavorites) {
            await user.updateOne({ $pull: { favorite: propertyId } });
            return res.status(200).json({ message: "Property removed from favorites." });
        }

        user.favorite.push(propertyId);

        await user.save();

        return res.status(201).json({ message: "Property added to favorites." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error.", error: error.message });
    }
}


export const removeFavorite = async (req, res) => {
    const { id } = req.params; // Property ID
    const userId = req.user.id; // Get user ID from token or session

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the property is in the user's favorites
        if (!user.favorite.includes(id)) {
            return res.status(400).json({ message: "Property not in favorites" });
        }

        // Remove property from favorites
        user.favorite = user.favorite.filter(fav => fav.toString() !== id);
        await user.save();

        res.status(200).json({ message: "Property removed from favorites", user });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error.", error: error.message });
    }
}



