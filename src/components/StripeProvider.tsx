'use client'

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React from 'react';
import config from '@/config';

const stripePromise = loadStripe(config.stripe.publishableKey);

export function StripeProvider({ children }: { children: React.ReactNode }) {
    return (
        <Elements stripe={stripePromise}>
            {children}
        </Elements>
    );
}

