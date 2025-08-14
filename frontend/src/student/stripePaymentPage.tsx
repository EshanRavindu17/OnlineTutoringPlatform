import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Load Stripe key from .env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string); // For Vite

const StripePaymentPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load.');

      // Call Django backend to create a Checkout Session
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/create-checkout-session/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Optional: Include product info or session ID here if you want
          session_id: "68355356812c4ad7dc68e386",
        }),
      });

      if (!response.ok) throw new Error('Failed to create checkout session.');

      const session = await response.json();
      if (!session.id) throw new Error('Invalid session ID.');

      console.log(session.id)

      const result = await stripe.redirectToCheckout({ sessionId: session.id });
      if (result.error) throw new Error(result.error.message);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMessage);
      console.error('Checkout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-10">
      <div className="bg-gray-50 rounded-lg p-8 shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Complete Your Purchase</h1>

        <div className="bg-white border border-gray-200 rounded p-4 mb-6 flex">
          <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center mr-5">
            Product
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Premium Plan</h3>
            <p className="text-gray-600">Access to all premium features for one month</p>
            <div className="text-indigo-600 font-bold text-xl mt-1">$19.99</div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 transition-all disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Proceed to Checkout'}
        </button>
      </div>
    </div>
  );
};

export default StripePaymentPage;
