import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import Property from "../models/propertyModel.js";
import { Owner } from "../models/ownerModel.js";
import { User } from "../models/userModel.js";
import { checkForToken } from "../controllers/auth.controller.js";
import { addFavorites, getFavorites, removeFavorite, searchResult, searchSuggestion, applyFilter } from "../controllers/property.controller.js";


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
router.get("/homeData", checkForToken, async (req, res) => {
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

        return res.status(200).json({ Sponsored, newList, futureProject });
    } catch (error) {

        console.log(error.message)
        return res.status(500).json({ message: "Internal Server Error.", error: error.message });
    }
});


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
router.get("/propertyDetail/:id", checkForToken, async (req, res) => {
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
})

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
