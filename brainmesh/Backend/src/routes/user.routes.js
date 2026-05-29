import { Router } from "express";
import {
    userRegister,
    userLogin,
    getCurrentUser,
    forgetPassword,
    loggedOutUser
} from "../controller/user.controller.js";
import { authUser } from "../middleware/auth.middelware.js";

const router = Router();

router.route("/register").post(userRegister);
router.route("/login").post(userLogin);
router.route("/me").get(authUser ,getCurrentUser);
router.route("/logout").get(authUser ,loggedOutUser);
// router.route("/forgot-password").post(forgetPassword);


export default router;
