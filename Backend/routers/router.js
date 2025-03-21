import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import Property from "../models/propertyModel.js";
import { Owner } from "../models/ownerModel.js";
import { User } from "../models/userModel.js";
import { checkForToken } from "../controllers/auth.controller.js";
import {  addFavorites, getFavorites, removeFavorite, searchResult, searchSuggestion } from "../controllers/property.controller.js";


const router = express.Router();
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

// Redirect to Homepage
router.get("/home", async (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});





router.get("/homeData", async (req, res) => {
    try {

        // 2 Sponsored docs
        // 1 image ,  location.city, state , price  , contact , configuration.
        const Sponsored = await Property.aggregate([
            {
                $match: {
                    sponsored: false
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
                $limit: 3
            },
            {
                $project: {
                    images: 1,
                    price: 1,
                    configuration: 1,
                    city: "$location.city",
                    state: "$location.state",
                    owner: "$owner.name",
                    phone: "$owner.phone"
                }
            }
        ]);

        // New properties of bangalore , 8 docs


        // under Construction projects of bangalore.  // 4 docs 

        return res.status(200).json({ Sponsored });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error.", error: error.message });
    }
});


router.get("/search/suggestion", searchSuggestion);

// Get the city by searching  : GET /search/results?city=cityName
router.get("/search/results",searchResult )


// Getting the favorite from the user data 
router.get("/favorites", checkForToken, getFavorites )

// Adding and removing from the favorite.
router.post("/favorites", checkForToken, addFavorites );


// Removing from the favorite list
router.delete("/favorites/:id", removeFavorite);




// For Adding data 
router.post("/property", async (req, res) => {
    try {

        const data = await Property.insertMany(req.body);

        console.log(data);
        return res.status(201).json({ data });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
})

router.post("/owner", async (req, res) => {
    try {
        const data = await Owner.insertMany(req.body);
        console.log(data);
        return res.status(201).json({ data });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
})

export { router };
