const Payment = require('../models/Payment');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const getExpiryDate = (planType) => {
  const date = new Date();
  if (planType === 'monthly') {
    date.setMonth(date.getMonth() + 1);
    return date;
  }
  if (planType === 'yearly') {
    date.setFullYear(date.getFullYear() + 1);
    return date;
  }
  return null;
};

// Create checkout session
exports.createCheckoutSession = async (req, res) => {
  try {
    const { planType, amount } = req.body;
    const validPlanTypes = ['monthly', 'yearly', 'lifetime'];
    const selectedPlanType = validPlanTypes.includes(planType) ? planType : 'lifetime';
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Use provided amount or default
    const paymentAmount = amount || 99;
    const planName = selectedPlanType === 'monthly'
      ? 'Monthly'
      : selectedPlanType === 'yearly'
      ? 'Yearly'
      : 'Lifetime';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'inr',
          product_data: {
            name: `IDE Pro ${planName} Plan`,
            description: 'Unlock multi-LLM access, advanced features, and premium support'
          },
          unit_amount: Math.round(paymentAmount * 100) // Convert to paise
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-cancel`,
      customer_email: user.email,
      metadata: {
        userId: userId.toString(),
        planType: selectedPlanType
      }
    });

    // Save payment record
    const payment = new Payment({
      userId,
      stripeSessionId: session.id,
      stripeCheckoutUrl: session.url,
      amount: paymentAmount,
      currency: 'inr',
      planType: selectedPlanType,
      status: 'pending',
      features: ['unlimited_execution', 'multi_llm', 'priority_support']
    });
    await payment.save();

    res.json({
      success: true,
      sessionId: session.id,
      checkoutUrl: session.url,
      url: session.url  // For compatibility with different frontend implementations
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Verify payment
exports.verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const payment = await Payment.findOne({ stripeSessionId: sessionId });
      
      if (!payment) {
        return res.status(404).json({ success: false, error: 'Payment not found' });
      }

      // Update payment status
      payment.status = 'completed';
      payment.paymentDate = new Date();
      payment.isActive = true;
      payment.expiryDate = getExpiryDate(payment.planType);

      await payment.save();

      // Update user plan if still free
      const user = await User.findById(payment.userId);
      if (user && user.plan !== 'premium') {
        user.plan = 'premium';
        await user.save();
      }

      res.json({
        success: true,
        message: 'Payment verified and processed',
        plan: 'premium',
        sessionId,
      });
    } else {
      res.status(400).json({ success: false, error: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get user payments
exports.getUserPayments = async (req, res) => {
  try {
    const userId = req.user._id;
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });

    res.json({ success: true, data: payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Handle Stripe webhook
exports.handleWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      const payment = await Payment.findOne({ stripeSessionId: session.id });
      if (payment) {
        payment.status = 'completed';
        payment.paymentDate = new Date();
        payment.isActive = true;
        payment.expiryDate = getExpiryDate(payment.planType);

        await payment.save();

        const user = await User.findById(payment.userId);
        if (user && user.plan !== 'premium') {
          user.plan = 'premium';
          await user.save();
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
};
