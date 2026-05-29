import { Payment } from "../models/payment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Stripe } from "stripe";
import {client} from "../db/redis.js"
import { User } from "../models/user.model.js";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const stripe = new Stripe(
//   process.env.NODE_ENV === "production"
//     ? process.env.STRIPE_SECRET_KEY_LIVE  // live mode
//     : process.env.STRIPE_SECRET_KEY_TEST  // test mode
// );

// ✅ Create checkout session
const payment = asyncHandler(async (req, res) => {
  console.log("payment merin aay...................................");
    const alreadyPaid = await client.get(`Payment:${req.user._id}`);
    
    if (alreadyPaid) {
      return res.status(400).json({ error: "Payment already made" });
    }
    

  
    try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Multi-LLM Subscription",
              description: "Unlock Multi-LLM and premium features",
            },
            unit_amount: 9900, // amount in paise (₹99.00 INR)
            tax_behavior: "inclusive",
          },
          quantity: 1,
        },
      ],
      success_url: "http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:5173/cancel",
    });

    

    

    const sessionStatus = ((process.env.NODE_ENV === "development") ? "paid" : "unpaid");
    // const sessionStatus = ((process.env.NODE_ENV === "production") ? session.payment_status : "unpaid");
    


    if (sessionStatus === "paid") {
        const userEmail = ((process.env.NODE_ENV === "development") ? `${req.user.email}` : session.customer_details.email);
        const user = await User.findById(req.user._id);

        const name = user.fullName || "testuserxx";
        const userName = ((process.env.NODE_ENV === "development") ? `${name}` : session.customer_details.name);
       
        // Save payment in DB
        await Payment.create({
            user: req.user._id,
            stripeSessionId: session.id,
            userName: userName,
            userEmail: userEmail,
            amount: 9900,
            currency: "inr",
        });
        const stringData = JSON.stringify({
            user: req.user._id,
            stripeSessionId: session.id,
            userName: userName,
            userEmail: userEmail,
            amount: 9900,
            currency: "inr",
        })
        await client.set(`Payment:${req.user._id}`, stringData);
  
        
        
    }

    res.json({ success:true, id: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ success:false, error: error.message });
  }
});


const verifyPayment = asyncHandler(async (req, res) => {
    const user = req.user

    const redisUser = await client.get(`Payment:${user._id}`);
    if(!redisUser) {
        return res.status(401).json({ success: false, message: "Need To do Payment" });
    }

    if (redisUser) {
        return res.status(200).json({ success: true, message: "Payment verified successfully from cache" });
      }else {
        return res.status(401).json({ success: false, message: "Need To do Payment" });
    }

});


export { payment , verifyPayment};

