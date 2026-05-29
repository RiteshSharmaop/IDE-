import React, { useState } from 'react';
import { X, Crown, CheckCircle, Loader } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { apiClient } from '../lib/api';

// Initialize Stripe - handle missing key gracefully
let stripePromise = null;
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
if (stripeKey) {
  stripePromise = loadStripe(stripeKey);
}

const PaymentModal = ({ isOpen, onClose, theme, colors }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const c = colors || {
    dark: {
      bg: '#1E1E1E',
      bgSecondary: '#252526',
      bgTertiary: '#2D2D2D',
      border: '#3E3E42',
      text: '#E0E0E0',
      textMuted: '#9CA3AF',
      accent: '#B0C4DE',
    },
    light: {
      bg: '#FFFFFF',
      bgSecondary: '#F8F8F8',
      bgTertiary: '#F0F0F0',
      border: '#E0E0E0',
      text: '#2D2D2D',
      textMuted: '#6B7280',
      accent: '#36454F',
    },
  };

  const currentColors = c[theme] || c.dark;

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please login again.');
        return;
      }

      // Create checkout session
      const response = await apiClient.post(
        '/payment/create-checkout-session',
        { planType: 'lifetime', amount: 99 }
      );

      if (response.data.success) {
        // Use checkoutUrl or url (for compatibility)
        const checkoutUrl = response.data.checkoutUrl || response.data.url;
        
        if (checkoutUrl) {
          // Redirect to Stripe checkout
          window.location.href = checkoutUrl;
        } else {
          setError('No checkout URL received. Please try again.');
        }
      } else {
        setError(response.data.error || 'Failed to create payment session');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(
        err.response?.data?.error || 
        'Failed to process payment. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative z-10 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border"
        style={{
          backgroundColor: currentColors.bg,
          borderColor: currentColors.border,
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg transition-all hover:opacity-70"
          style={{ color: currentColors.text }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="p-8 pb-0 flex flex-col items-center">
          <Crown
            size={48}
            className="mb-4"
            style={{ color: '#FCD34D' }}
          />
          <h2
            className="text-3xl font-bold mb-2"
            style={{ color: currentColors.text }}
          >
            Upgrade to Pro
          </h2>
          <p
            className="text-center text-sm"
            style={{ color: currentColors.textMuted }}
          >
            Unlock premium features and unlimited multi-LLM access
          </p>
        </div>

        {/* Price Section */}
        <div className="p-8">
          <div
            className="rounded-xl p-6 text-center mb-6"
            style={{
              background: 'linear-gradient(135deg, #B0C4DE 0%, #8A9AAA 100%)',
            }}
          >
            <p className="text-4xl font-bold text-white">₹99</p>
            <p className="text-sm text-gray-200 mt-1">One-time payment</p>
          </div>

          {/* Features List */}
          <div className="space-y-3 mb-6">
            {[
              'Lifetime access to all features',
              'Multi-LLM mode (5+ models)',
              'Priority code execution',
              'Advanced analytics & insights',
              'Priority support',
              'Early access to new features',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle size={18} style={{ color: '#10B981' }} />
                <span
                  className="text-sm"
                  style={{ color: currentColors.text }}
                >
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="mb-4 p-3 rounded-lg text-sm"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#EF4444',
              }}
            >
              {error}
            </div>
          )}

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 mb-3"
            style={{
              background: isProcessing
                ? 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)'
                : 'linear-gradient(135deg, #B0C4DE 0%, #8A9AAA 100%)',
              color: '#FFFFFF',
              opacity: isProcessing ? 0.7 : 1,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
            }}
          >
            {isProcessing && <Loader size={18} className="animate-spin" />}
            {isProcessing ? 'Processing...' : 'Pay ₹99 & Upgrade'}
          </button>

          {/* Cancel Button */}
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-full py-2 rounded-lg font-medium transition-all"
            style={{
              backgroundColor: currentColors.bgTertiary,
              color: currentColors.text,
              opacity: isProcessing ? 0.5 : 1,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
            }}
          >
            Cancel
          </button>
        </div>

        {/* Security Info */}
        <div
          className="px-8 pb-6 text-center text-xs"
          style={{ color: currentColors.textMuted }}
        >
          💳 Secure payment powered by Stripe
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
