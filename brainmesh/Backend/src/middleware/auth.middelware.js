import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { BlacklistToken } from "../models/blacklistToken.model.js";

export const authUser = asyncHandler(async (req, res, next) => {
    try {
        // console.log("Debug - Headers:", req.headers);
        // console.log("Debug - Cookies:", req.cookies);
        const token =
            req.cookies?.token || req.headers?.authorization?.split(" ")[1];
        // console.log("Debug - Extracted token:", token);
        // const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            return next(new ApiError(401, "Unauthorized Request"));
        }
        console.log("Middleware - Token found:", token);
        
        
        const blacklistedToken = await BlacklistToken.findOne({ token });
        if (blacklistedToken) {
            return next(
                new ApiError(401, "Unauthorized Request: Blacklisted Token")
            );
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decodedToken?._id);

        if (!user) {
            return next(new ApiError(401, "Invalid Access Token"));
        }

        req.user = user;
        console.log("User from auth middleware:", user.email);

        next();
    } catch (error) {
        console.log("error in auth.js middleware ", error.message);
        return next(
            new ApiError(401, error?.message || "Invalid Access Token")
        );
    }
});
