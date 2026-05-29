import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { BlacklistToken } from "../models/blacklistToken.model.js";
import { client } from "../db/redis.js";

const redisClient = client;

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true only in production (HTTPS)
    sameSite: "strict",
    path: "/", 
    maxAge: 24 * 60 * 60 * 1000, // 1 day
};

const userRegister = asyncHandler(async (req, res) => {
    try {
       

        const { fullName, email, password, confirmPassword } = req.body;
        if (!fullName || !email || !password || !confirmPassword) {
            return res
                .status(400)
                .json(new ApiError(400, "Please fill in all fields"));
        }

        for (let i = 0; i < password.length; i++) {
            if (password[i] === " ") {
                return res
                    .status(400)
                    .json(
                        new ApiError(400, "Password should not contain spaces")
                    );
            }
        }
        let addrade = false;
        for (let i = 0; i < email.length; i++) {
            if (email[i] === " ") {
                return res
                    .status(400)
                    .json(new ApiError(400, "Email should not contain spaces"));
            }
            if (email[i] === "@") {
                addrade = true;
            }
        }
        if (!addrade) {
            return res
                .status(400)
                .json(new ApiError(400, "Email should contain @"));
        }

        const existingUser = await User.findOne({
            $or: [{ email }],
        });

        if (existingUser) {
            return res
                .status(409)
                .json(new ApiError(409, "User already exists"));
        }

        const user = await User.create({
            fullName,
            email,
            password,
        });

        if (!user) {
            return res
                .status(500)
                .json(
                    new ApiError(500, "Something went wrong while Registring")
                );
        }

        const token = user.generateAuthToken();


        // Store token in Redis with an expiration time
        await redisClient.set(`User:${token}`, JSON.stringify(user), { EX: 24 * 60 * 60 }); // 1 day expiration


        // Set cookie
        res.cookie("token", token, cookieOptions);

        res.status(201).json(
            new ApiResponse(
                201,
                {
                    user,
                    token,
                },
                "User Registered Successfully"
            )
        );
    } catch (error) {
        console.log("❤️❤️🎶");
        console.log(error);
        return res.status(500).json(new ApiError(500, "Internal Server Error"));
    }
});

const userLogin = asyncHandler(async (req, res) => {
    // req.body take data from user - > (username, email , password)
    // validate input fields are not empty and in correct formate
    // find user if it exist or not - > if not send to register page
    // encrypt pass & check password is correct or not
    // generate access and refresh token and send to user by secure cookies
    // if correct authenticate user tu accesss things
    // return response



    const cacheToken = req.cookies?.token || req.headers?.authorization?.split(" ")[1];
    const redisCachedToken = await redisClient.get(`User:${cacheToken}`);
    if (redisCachedToken) {
        return res
            .status(201)
            .json(new ApiResponse(201, null, "User already logged in"));
    }

    const { email, password } = req.body;
    
    if (email == "" || password == "") {
        throw new ApiError(400, "All fields are required");
    }
    let ad = 0;
    for (let i = 0; i < email.length; ++i) {
        if (email[i] == "@") ad++;
    }
    if (ad != 1) {
        throw new ApiError(400, "type Correct email");
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        throw new ApiError(404, "User not found");
    }


    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new ApiError(400, "Invalid Password");
    }
    const token = user.generateAuthToken();
    await redisClient.set(`User:${token}`, JSON.stringify(user), { EX: 24 * 60 * 60 }); // 1 day expiration

    // Set cookie
    res.cookie("token", token, cookieOptions);
    console.log("User Logged In");
    return res
        .status(201)
        .json(new ApiResponse(201, { token, user }, "User Login Successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    console.log('Current user request :>> ', req.user);
    return res
        .status(201)
        .json(
            new ApiResponse(201, req.user, "Current User Fetched Successfully")
        );
});

const loggedOutUser = asyncHandler(async (req, res) => {
    const token =
        req.cookies?.token || req.headers?.authorization?.split(" ")[1];

    if (!token) {
        throw new ApiError(401, "Unauthorized Request");
    }

    // Add to blacklist
    await BlacklistToken.create({ token });


    // Remove from Redis
    await redisClient.del(`User:${token}`);

    // Clear cookie with same options used when setting it
    res.clearCookie("token", cookieOptions);
    console.log("User Logged Out");

    return res
        .status(201)
        .json(new ApiResponse(201, null, "User Logout Successfully"));
});

const forgetPassword = asyncHandler(async (req, res) => {
    return res
        .status(201)
        .json(new ApiResponse(201, null, "User Logout Successfully"));
});

export { userRegister, userLogin, getCurrentUser, forgetPassword , loggedOutUser };
