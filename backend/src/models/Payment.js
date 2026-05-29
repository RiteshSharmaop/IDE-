const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    stripeSessionId: {
      type: String,
      required: true,
      unique: true
    },
    stripeCheckoutUrl: String,
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'usd'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending'
    },
    planType: {
      type: String,
      enum: ['monthly', 'yearly', 'lifetime'],
      required: true
    },
    features: [{
      type: String
    }],
    paymentDate: Date,
    expiryDate: Date,
    isActive: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
