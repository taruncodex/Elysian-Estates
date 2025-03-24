import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import Property from "../models/propertyModel.js";
import { Owner } from "../models/ownerModel.js";
import { User } from "../models/userModel.js";
import { checkForToken } from "../controllers/auth.controller.js";
import { addFavorites, getFavorites, removeFavorite, searchResult, searchSuggestion, applyFilter, homeData,propertyDetails } from "../controllers/property.controller.js";


const router = express.Router();
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

// Redirect to Homepage
router.get("/home", checkForToken, async (req, res) => {

    res.sendFile(path.join(__dirname, "../public/index.html"));
});


// Serving the favorite file
router.get("/favorite", checkForToken, async (req, res) => {
    // console.log(req.user);
    res.sendFile(path.join(__dirname, "../public/favorite.html"));
});

// <!------  Property Lisst Detail  ------>
router.get("/property", async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, "../public/propertyList.html"))
    } catch (error) {
        res.status(500).json({ message: "Internal Server error", error: error.message });
    }
})



// <!------  Property Detail Route  -------->
router.get("/property/:id", (req, res) => {
    try {
        res.sendFile(path.join(__dirname, "../public/propertyDetails.html"))
    } catch (error) {
        res.status(500).json({ message: "Internal Server error", error: error.message });
    }
})




// http://localhost:3000/user/homeData 
router.get("/homeData", checkForToken, homeData);


// http://localhost:3000/user/search/suggestions?query=cityName
router.get("/search/suggestions", checkForToken, searchSuggestion);

// Get the city by searching  : GET /search/results?city=cityName
router.get("/search/results", checkForToken, searchResult)


// Getting the favorite from the user data 
router.get("/favorites", checkForToken, getFavorites);

router.get("/properties/filter", checkForToken, applyFilter)


// Adding and removing from the favorite.
router.post("/favorites", checkForToken, addFavorites);


// Removing from the favorite list
router.delete("/favorites/:id", removeFavorite);



// <!------------   Single Property Detail   --------------->
router.get("/propertyDetail/:id", checkForToken, propertyDetails)

// router.get("/propertyDetails", checkForToken, async (req, res) => {
//     try {


//     } catch (error) {
//         res.status(500).json({ message: "Internal Server error", error: error.message });
//     }
// })


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
