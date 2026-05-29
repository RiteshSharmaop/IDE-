import { Router } from "express";
import { authUser } from "../middleware/auth.middelware.js";
import { payment , verifyPayment} from "../controller/payment.controller.js";

const router = Router();

router.post("/create-checkout-session", authUser, payment);
router.get("/verify-payment", authUser, verifyPayment);


export default router;
