import { User } from "../models/userModel.js";
import Property from "../models/propertyModel.js";

export const homeData = async (req, res) => {
    try {

        // 2 Sponsored docs
        // 1 image ,  location.city, state , price  , contact , configuration.
        const Sponsored = await Property.aggregate([
            {
                $match: {
                    sponsored: true
                }
            },
            {
                $lookup: {
                    from: "owners", // Name of the 'Owner' collection
                    localField: "listedBy", // Field in Property referencing Owner's _id
                    foreignField: "_id", // Owner's _id field
                    as: "owner"
                }
            },
            {
                $limit: 2
            },
            {
                $project: {
                    title: 1,
                    propertyType: 1,
                    residenceType: 1,
                    images: 1,
                    price: 1,
                    configuration: 1,
                    status: "available",
                    city: "$location.city",
                    state: "$location.state",
                    owner: "$owner.name",
                    phone: "$owner.phone"
                }
            }
        ]);

        // New properties of bangalore , 8 docs
        const newList = await Property.aggregate([
            {
                $match: {
                    "location.city": "Bangalore"
                },
            },
            { $limit: 8 },
            {
                $project: {
                    title: 1,
                    propertyType: 1,
                    residenceType: 1,
                    areaSqFt: 1,
                    images: 1,
                    price: 1,
                    configuration: 1,
                    status: 1,
                    city: "$location.city",
                    state: "$location.state",
                }
            }
        ])

        // under Construction projects of bangalore.  // 4 docs

        const futureProject = await Property.aggregate([{
            $match: {
                status: "under Construction"
            }
        },
        { $limit: 5 },
        {
            $project: {
                title: 1,
                propertyType: 1,
                residenceType: 1,
                areaSqFt: 1,
                images: 1,
                price: 1,
                configuration: 1,
                status: 1,
                city: "$location.city",
                state: "$location.state",
            }
        }
        ]);

        return res.status(200).json({ user: req.user, Sponsored, newList, futureProject });
    } catch (error) {

        console.log(error.message)
        return res.status(500).json({ message: "Internal Server Error.", error: error.message });
    }
}


export const searchSuggestion = async (req, res) => {
    try {
        console.log("Entered into the suggestion route");
        // GET /api/search/suggestions?query=city 
        const { query } = req.query;
        if (!query || query.length < 2) {
            return res.status(400).json({ message: "Query must be at least 2 characters" });
        }
        // Step 1: Find distinct city names that match the search term
        const cities = await Property.distinct("location.city", {
            "location.city": { $regex: query, $options: "i" } // Case-insensitive search
        });

        console.log({ cities });
        return res.status(200).json({ cities });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error.", error: error.message });
    }
}


export const searchResult = async (req, res) => {
    try {
        const { city, propertyType, landType, residenceType, } = req.query;
        let { page, limit } = req.query;
        console.log({ city, propertyType, landType, residenceType });
        let query = {}

        // Convert to numbers and set default values
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;

        // Calculate the starting index
        const startIndex = (page - 1) * limit;

        if (city != 'null') {
            const cityArray = city.split(",");
            query['location.city'] = cityArray.length > 1 ? { $in: cityArray } : cityArray[0];
        }

        if (propertyType !== 'null') {
            const propertyTypeArray = propertyType.split(",");
            query.propertyType = propertyTypeArray.length > 1 ? { $in: propertyTypeArray } : propertyTypeArray[0];
        }

        if (landType != 'null') {
            const landArray = landType.split(",");
            query.landType = landArray.length > 1 ? { $in: landArray } : landArray[0];
        }

        if (residenceType != 'null') {
            const residenceArray = residenceType.split(",");
            query.residenceType = residenceArray.length > 1 ? { $in: residenceArray } : residenceArray[0];
        }


        console.log({ query });

        // Fetch filtered properties
        const properties = await Property.find(query).populate("listedBy").skip(startIndex).limit(limit);

        if (properties.length == 0) {
            return res.status(404).json({ Message: "No Data Available" });
        }

        // console.log(properties)
        return res.status(200).json({ properties, metaData: { city, propertyType, landType, residenceType } });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });;
    }
}


export const getFavorites = async (req, res) => {
    try {

        // Step 1: Get the authenticated user
        const user = req.user;
        console.log({ fav: user.favorite });

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




export const applyFilter = async (req, res) => {
    try {
        const {
            minPrice,
            maxPrice,
            landType,
            propertyType,
            residenceType,
            configuration,
            status,
            city
        } = req.query;

        let query = {};

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseInt(minPrice);
            if (maxPrice) query.price.$lte = parseInt(maxPrice);
        }

        if (landType) {
            query.landType = { $in: landType.split(",") };
        }

        if (propertyType) {
            query.propertyType = { $in: propertyType.split(",") };
        }


        if (residenceType) {
            query.residenceType = { $in: residenceType.split(",") };
        }

        if (configuration) {
            query.configuration = { $in: configuration.split(",") };
        }

        if (status) {
            query.status = { $in: status.split(",") };
        }

        console.log({ query });

        // Fetch filtered properties
        const properties = await Property.find(query);

        if (properties.length == 0) {
            return res.status(404).json({ Message: "No Data Available" });
        }

        // console.log(properties)
        return res.status(200).json({ properties });


    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error.", error: error.message });
    }
}



export const propertyDetails = async (req, res) => {
    try {
        const id = req.params.id;
        // console.log(id);
        const details = await Property.findById(id);
        // console.log(data);
        if (!details) {
            return res.status(404).json({ message: "No data Found." })
        }

        return res.status(200).json({ details })
    } catch (error) {
        res.status(500).json({ message: "Internal Server error", error: error.message });
    }
}