import express, { Request, Response } from "express";
import Stripe from "stripe";
import prisma from "../prismaClient";

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2025-08-27.basil' });

// Test endpoint to verify the routes are working
// router.get('/test', async (req: Request, res: Response) => {
//   res.json({ 
//     message: 'Payment routes are working!', 
//     timestamp: new Date().toISOString(),
//     stripeConfigured: !!process.env.STRIPE_SECRET_KEY
//   });
// });

// Create payment intent
router.post('/create-payment-intent', async (req: Request, res: Response) => {
  try {
    const {
      amount,
      currency = 'usd',
      tutorId,
      studentId,
      sessionDate,
      sessionTime,
      duration,
      subject,
      selectedSlots
    } = req.body;

    console.log('Creating payment intent with data:', {
      amount,
      currency,
      tutorId,
      studentId,
      sessionDate,
      sessionTime,
      duration,
      subject,
      selectedSlots
    });

    // Validate required fields
    if (!amount || !tutorId || !studentId) {
      return res.status(400).json({ error: 'Missing required fields: amount, tutorId, studentId' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency,
      metadata: {
        tutorId,
        studentId,
        sessionDate: sessionDate || '',
        sessionTime: sessionTime || '',
        duration: duration?.toString() || '',
        subject: subject || '',
        selectedSlots: JSON.stringify(selectedSlots || [])
      }
    });

    console.log('Payment intent created:', paymentIntent.id);

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    if (error instanceof Error) {
      res.status(500).json({ 
        error: 'Failed to create payment intent', 
        details: error.message 
      });
    } else {
      res.status(500).json({ error: 'Failed to create payment intent' });
    }
  }
});

// Confirm payment and create session booking
router.post('/confirm-payment', async (req: Request, res: Response) => {
  try {
    const { paymentIntentId, sessionDetails } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    console.log('Payment confirmed for intent:', paymentIntent);

    // Create session data with minimal required fields
    const sessionData = {
      student_id: null, // Set to null to avoid foreign key issues in demo
      price: paymentIntent.amount / 100, // Convert back from cents
      status: 'scheduled' as const,
      materials: [],
      // Add optional fields with default values
      start_time: new Date('1970-01-01T10:00:00Z'), // Default time
      end_time: new Date('1970-01-01T11:00:00Z'), // Default time
    };

    console.log('Creating session with data:', sessionData);

    const paymentData = {
       student_id: null, // Set to null to avoid foreign key issues in demo
       payment_intent_id: paymentIntent.id,
       amount: paymentIntent.amount / 100, // Convert back from cents
       session_id: "d87b8ef6-c4a3-4cdb-babf-54d8830ac9f9",  
       status: paymentIntent.status,
       method: 'stripe',
       payment_data_time: new Date()
    };

    // Create new session
    const session = await prisma.sessions.create({
      data: sessionData
    });

    // const payment = await prisma.individual_Payments.create({
    //   data: paymentData
    // });

    console.log('Session created successfully:', session.session_id);

    res.json({
      success: true,
      sessionId: session.session_id,
      message: 'Payment confirmed and session booked successfully'
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    
    // Provide more detailed error information
    if (error instanceof Error) {
      res.status(500).json({ 
        error: 'Failed to confirm payment', 
        details: error.message 
      });
    } else {
      res.status(500).json({ error: 'Failed to confirm payment' });
    }
  }
});

// Get payment history for a student
router.get('/payment-history/:studentId', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const sessions = await prisma.sessions.findMany({
      where: {
        student_id: studentId
      },
      include: {
        Student: {
          include: {
            User: {
              select: {
                name: true,
                photo_url: true
              }
            }
          }
        }
      },
      orderBy: {
        session_id: 'desc'
      },
      skip,
      take: Number(limit)
    });

    const total = await prisma.sessions.count({
      where: {
        student_id: studentId
      }
    });

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      payments: sessions.map(session => ({
        id: session.session_id,
        amount: (session as any).price || 0,
        currency: 'usd',
        status: session.status || 'scheduled',
        sessionDate: session.start_time,
        sessionTime: session.start_time,
        duration: 1, // Default duration
        subject: 'Tutoring Session',
        tutorName: session.Student?.User?.name || 'Unknown',
        tutorPhoto: session.Student?.User?.photo_url || '',
        createdAt: session.session_id
      })),
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalItems: total,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(400).send('Webhook secret not configured');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.log('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('PaymentIntent was successful:', paymentIntent.id);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      console.log('PaymentIntent failed:', failedPayment.id);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Process refund
router.post('/refund', async (req: Request, res: Response) => {
  try {
    const { paymentIntentId, amount, reason = 'requested_by_customer' } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    // Create refund
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents if amount specified
      reason
    });

    res.json({
      success: true,
      refundId: refund.id,
      message: 'Refund processed successfully'
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ error: 'Failed to process refund' });
  }
});


// Getting payment history should be handled with pagination 

export default router;



