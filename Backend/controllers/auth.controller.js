import { User } from "../models/userModel.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import "dotenv/config";


// Transporter for nodemailer
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
        user: process.env.AUTH_USER,
        pass: process.env.AUTH_USER_PASS,
    },
});


// SignUp Logic for Employer
export const signUpUser = async (req, res) => {
    try {

        // Step-1 : Get the email, name , password and phone from the body
        // Step-2 : Verify if user enter the fields or not
        // Step-3 : Check is the user is already in the system
        // Step-4 : Hash the password
        // Step-5 : Create the Employee record ans save it into the mongodb
        // Step-6 : Send the success response.


        // Get data from the user
        const { email, name, password, phone } = req.body;
        console.log(email, name, password, phone)
        // Verify if user enter the fields or not
        if (!email || !name || !password || !phone) {
            return res.status(400).json({ msg: "email , name, password and phone are required." })
        }

        console.log(email, name, password, phone);

        // Check is the user is already in the system
        const checkUser = await User.findOne({ email });

        if (checkUser) {
            console.log("user already exist with this email");
            return res.status(400).json({ message: "This email is already in use." });
        }

        // Hash the password
        const hashPassword = await argon2.hash(password);

        // Create the Employee record
        const user = new User({
            name,
            email,
            password: hashPassword,
            phone,
        });

        // Save the record
        await user.save();

        console.log(user);

        // Send the success response.
        return res.status(201).json({
            message: "Signup successful"
        })

    } catch (error) {
        console.log(error.message);
        return res.status(401).json({ message: "Invalid credentials", error: error.message });
    }
}



export const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;
        // Check if email and password entered currectly. 
        console.log(email, password);
        if (!email || !password) {
            return res.status(400).json({ msg: "email and password  are required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            console.log(`No user exists with this email: ${email}`);
            return res.status(400).json({ message: "Incorrect email or password" });
        }

        // Hashing the Password
        const isValidUser = await argon2.verify(user.password, password);

        if (!isValidUser) {
            console.log("Incorrect password");
            return res.status(400).json({ message: "Incorrect email or password" });
        }

        // Creating accessToken Token
        const accessToken = jwt.sign(
            { id: user._id, name: user.name },
            process.env.JWT_ACCESS_PASS,
            { expiresIn: "1h" }
        );

        // Creating refreshToken
        const refreshToken = jwt.sign(
            { id: user._id, name: user.name },
            process.env.JWT_REFRESH_PASS,
            { expiresIn: "7d" }
        );

        // adding accessToken into the cookie 
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false,     // Check this when you go for production.
            sameSite: "strict",
            maxAge: 60 * 60 * 1000,
        });

        // adding refreshToken into the cookie 
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,    // Check this when you go for production.
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        console.log(req.cookies);
        console.log(user);

        // Send role of the user with success message. 
        res.status(200).json({ message: "login successful", user });
    } catch (error) {
        console.log({ err: error.message });
        return res.status(401).json({ err: error.message });
    }
}


const sendResetEmail = async (email, token) => {
    try {
        const resetLink = `${process.env.BASE_URL}/reset-password/${token}`;
        await transporter.sendMail({
            to: email,
            from: process.env.EMAIL_USER,
            subject: "Password Reset Request",
            html: `<p>You requested a password reset.</p>
               <p>Click the link below to reset your password:</p>
               <a href="${resetLink}"> ${resetLink} </a>
               <p>This link will expire in 15 minutes.</p>`,
        });
        console.log(`Reset email sent to ${email}`);
    } catch (error) {
        return res.status(400).json(error.message);
    }
};


export const forgotPassword = async (req, res) => {
    try {
        console.log("Entered in the Forget Password.")
        // Take the Email the from the user
        const { email } = req.body;
        console.log(email);
        // Find the user 
        const user = await User.findOne({ email });
        console.log(user);
        // If user is not present 
        if (!user) {
            console.log("user is not present in database with this email");
            return res.status(400).json({ message: "user not exist for this email" });
        }

        // Create the resetToken 
        const resetToken = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_RESET_PASS, { expiresIn: "5m" });
        console.log("Reset Password is generated")
        // add resetToken in cookie
        res.cookie("resetToken", resetToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
        });
        console.log("Reset Password add to cookie.")

        // Send reset link via email
        await sendResetEmail(email, resetToken);

        // Return the response
        return res.status(200).json({ message: "Password reset link sent to email", });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}


// Logic for ResetPassword 
export const resetPassword = async (req, res) => {
    try {
        console.log("Entered in the resetPassword.")
        const { token } = req.params;
        console.log({ token })
        // get the password 
        const { password } = req.body;
        // get resetToken from the cookies 
        console.log({ cookie: req.cookies });
        const resetToken = req.cookies.resetToken;
        console.log({ resetToken });

        if (!resetToken) {
            console.log("reset token has been deleted from cookies");
            return res.status(400).json({ message: "resetToken was valid for only 15 minutes" });
        }

        if (token != resetToken) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }


        // decode the resetToken  
        const decode = jwt.verify(token, process.env.JWT_RESET_PASS);
        console.log(decode)
        // Get the user record from its id.
        const user = await User.findOne({ _id: decode.id });


        // Hash the Password
        const hashPassword = await argon2.hash(password);

        // Save the password
        user.password = hashPassword;
        await user.save();

        // return the response.
        return res.status(200).json({ message: "Password updated successfully" });

    } catch (error) {
        console.log("Invalid reset token");
        res.status(400).json({ message: "Something went wrong" });
    }
}


// MiddleWare to check for the token.
export const checkForToken = async (req, res, next) => {
    console.log("Entered in token Verification.");
    // Get the accessToken from the cookies
    const accessToken = req.cookies.accessToken;
    console.log("Request headers:", req.headers);
    console.log("All cookies:", { accessToken });

    // If accessToken is present then decode it and get the user data from it and save into the req.user
    if (accessToken) {
        try {
            console.log("In the If Part")
            const decode = jwt.verify(accessToken, process.env.JWT_ACCESS_PASS);

            console.log({ decode })

            const user = await User.findOne({ _id: decode.id });

            req.user = user;

            next();

        } catch (error) {
            console.log("invalid access token");
            res.status(401).json({ message: "Unauthorized Access", error: error.message });
        }

    }

    // If accesstoken is not present then use refresh token to create the accesstoken
    else {
        console.log("In the else Part")
        try {

            // Get the refreshToken
            const refreshToken = req.cookies["refreshToken"];
            console.log("refreshToken", refreshToken);

            if (!refreshToken) {
                console.log("Neither Access nor Refresh token is present");
                return res.status(401).json({ message: "Unauthorized Access" });
            }


            // Decode the the refreshToken 
            const decode = jwt.verify(refreshToken, process.env.JWT_REFRESH_PASS);

            console.log(decode);

            // Create a new accessToken 
            const newAccessToken = jwt.sign(
                { id: decode.id, name: decode.name },
                process.env.JWT_ACCESS_PASS,
                { expiresIn: "1h" }
            );


            // Save the accessToken in to cookie
            res.cookie("accessToken", newAccessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 60 * 60 * 1000,
            });


            // Get the data from the mongo
            const user = await User.findOne({ _id: decode.id });
            // save the user record into the req.user.
            req.user = user; s
            // After all checks go for the next response handler
            next();

        } catch (error) {
            console.log("invalid refresh token");
            res.status(401).json({ message: "Unauthorized Access", error: error.message });
        }
    }

}