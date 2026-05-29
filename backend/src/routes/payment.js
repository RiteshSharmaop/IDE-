const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createCheckoutSession,
  verifyPayment,
  getUserPayments,
  handleWebhook
} = require('../controllers/paymentController');

// Webhook route (no auth needed)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.use(protect);

router.post('/create-checkout-session', createCheckoutSession);
router.post('/verify-payment', verifyPayment);
router.get('/user-payments', getUserPayments);

module.exports = router;
