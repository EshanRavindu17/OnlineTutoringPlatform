import express, { Request, Response } from "express";
import Stripe from "stripe";
import prisma from "../prismaClient";
import { createASession, createEnrolment, createMassPayment, updateSlotStatus } from "../services/studentService";
import { parseArgs } from "util";
import { Status } from "@prisma/client";
import { createPaymentRecord } from "../services/paymentService";
import { UUID } from "crypto";

const router = express.Router();

interface SessionData {
  student_id: string;
  i_tutor_id: string;
  slots: string[]; // Array of slot times like "1970-01-01T15:00:00.000Z"
  status: string;
  price: number;
  date: string; // Date of the session
}

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

    // Find the customer ID for the student
    const customer_id = (await prisma.student.findUnique({
      where: { student_id: studentId },
      select: { customer_id: true }
    }))?.customer_id;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency,
      customer: customer_id || undefined,
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

// Confirm payment and create session booking This is only for individual Session booking 
router.post('/confirm-payment', async (req: Request, res: Response) => {

console.log('Confirm payment request received:', req.body);
  try {
    const { paymentIntentId, sessionDetails } = req.body;

    console.log('Payment Intent ID:', paymentIntentId);
    console.log('Session Details:', sessionDetails);

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    if (!sessionDetails) {
      return res.status(400).json({ error: 'Session details are required' });
    }

    // Validate sessionDetails structure
    const { student_id, i_tutor_id, slots, status, price, date } = sessionDetails as SessionData;
    
    if (!student_id || !i_tutor_id || !slots || !Array.isArray(slots) || slots.length === 0 || !status || !price || !date) {
      return res.status(400).json({ 
        error: 'Invalid session details. Required: student_id, i_tutor_id, slots, status, price, date' 
      });
    }

    let paymentIntent: any;

    // Retrieve payment intent from Stripe
    paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    console.log('Retrieved payment intent:', paymentIntent);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    console.log('Payment confirmed for intent:', paymentIntent.id);
    console.log('Session details received:', sessionDetails);

    // Convert slot strings to Date objects
    const slotsAsDate = slots.map(slot => new Date(slot));
    console.log('Date:', date);
    const sessionDate = new Date(date);

    console.log('Session Date:', sessionDate);



    const timeSlots = await prisma.free_Time_Slots.findMany({
      where: {
        i_tutor_id: i_tutor_id,
        date: sessionDate,
        start_time: {
          in: slotsAsDate
        },
        status: 'free' // Only update free slots
      }
    });

    if(timeSlots.length === slotsAsDate.length) {
      console.log(`Found ${timeSlots.length} time slots to update`);
    }
    else{
        return res.status(404).json({ error: 'One of your selected time slots is not available now' });
    }


    // Update each slot status to 'booked'
    const updatePromises = timeSlots.map(slot => 
      updateSlotStatus(slot.slot_id, 'booked' as any)
    );

    await Promise.all(updatePromises);

    console.log('Time slots updated successfully');



    // Create the session using the service function
    const session = await createASession(
      student_id,
      i_tutor_id,
      slotsAsDate,
      status as any, // Cast to SessionStatus enum
      sessionDetails.subject,
      price,
      sessionDate
    );

    const session_id = session.session_id; // session ID

    const i_tutor_name = (await prisma.individual_Tutor.findUnique({ // find tutor name
      where: { i_tutor_id },
      select: { User: { select: { name: true } } }
    })).User.name;

    const student_name = (await prisma.student.findUnique({ // find student name
      where: { student_id },
      select: { User: { select: { name: true } } }
    })).User.name;

    const title = `${student_name}' - ${i_tutor_name} - ${session_id}`; // session title

    console.log('Session title prepared:', title);

    const sessiondata = (await prisma.sessions.updateMany({
      where: { session_id },
      data: { title: title }
    }));

    console.log('Session created successfully:', session.session_id);

    console.log('Slots to be updated:', sessiondata);

    // Update the status of each time slot to 'booked'
    // First, we need to get the slot_ids for the selected slots
    // const timeSlots = await prisma.free_Time_Slots.findMany({
    //   where: {
    //     i_tutor_id: i_tutor_id,
    //     date: sessionDate,
    //     start_time: {
    //       in: slotsAsDate
    //     },
    //     status: 'free' // Only update free slots
    //   }
    // });

    // console.log(`Found ${timeSlots.length} time slots to update`);

    // // Update each slot status to 'booked'
    // const updatePromises = timeSlots.map(slot => 
    //   updateSlotStatus(slot.slot_id, 'booked' as any)
    // );

    // await Promise.all(updatePromises);

    // console.log('Time slots updated successfully');

    

    interface PaymentData {
      student_id: string;
      payment_intent_id: string;
      amount: number;
      session_id: string;
      status: Status;
      method: string;
    }

    // Optional: Create payment record
    const paymentData: PaymentData = {
      student_id: student_id,
      payment_intent_id: paymentIntent.id,
      amount: price, // Use the original price
      session_id: session.session_id,
      status: 'success',
      method: 'stripe',
    };

    console.log('Payment data prepared:', paymentData);

    // Uncomment this if you want to store payment records
    // const payment = await prisma.individual_Payments.create({
    //   data: paymentData
    // });

    // Add a record for this payment
    const payment = await createPaymentRecord(paymentData); // This create a individual payment record

    console.log('Payment record created:', payment);

    res.json({
      success: true,
      sessionId: session.session_id,
      message: 'Payment confirmed and session booked successfully',
      slotsUpdated: timeSlots.length
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



// Mass Tutor Subscription Payment routes 


router.post('/create-payment-intent-mass', async (req: Request, res: Response) => {
  try {
    const { studentId, classId, amount } = req.body;
    console.log('Creating payment intent for mass class with data:', { studentId, classId, amount });
    // Fetch price_id from class
    if(!classId || !studentId){
      return res.status(400).json({ error: 'Class ID and Student ID are required' });
    }

    const customer_id = (await prisma.student.findUnique({
      where: { student_id: studentId },
      select: { customer_id: true }
    }))?.customer_id;

    // if (!customer_id) {
    //   return res.status(404).json({ error: 'Customer not found for the student' });
    // }

    const usdAmount = Math.round((amount * 100) / 300); // Convert to cents
    console.log('Amount in USD cents:', usdAmount);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: usdAmount, // Example amount in cents
      currency: 'usd',
      customer: customer_id || undefined,
      metadata: {
        studentId,
        classId
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Error creating paymentIntent for Mass Students:', error);
    res.status(500).json({ error: 'Failed to create paymentIntent for Mass Students' });
  }
});






router.post('/confirm-payment-mass', async (req: Request, res: Response) => {
  try {
    const { paymentIntentId, studentId, classId, amount } = req.body;
    
    console.log('Confirm payment for mass class request received:', req.body);

    // Retrieve the subscription from Stripe
    if (!classId || !studentId) {
      return res.status(400).json({ error: 'Class ID and Student ID are required' });
    }

    const payment = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    if (payment.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }
    // Create a mass payment record
    const massPayment = await createMassPayment(studentId, classId, amount);
    console.log('Mass payment record created:', massPayment);
    // Create an enrolment record
    const enrolment = await createEnrolment(studentId, classId);
    console.log('Enrolment record created:', enrolment);

    res.status(200).json({
      success: true,
      enrollmentId: enrolment.enrol_id,
      message: 'Payment confirmed and enrolment created successfully'
    });

  } catch (error) {
    console.error('Error confirming subscription:', error);
    res.status(500).json({ error: 'Failed to confirm subscription' });
  }
});


// router.post('/cancel-subscription', async (req: Request, res: Response) => {
//   try {
//     const { subscriptionId ,classId } = req.body;
//     if (!subscriptionId) {
//       return res.status(400).json({ error: 'Subscription ID is required' });
//     }


//     // Cancel the subscription in Stripe
//     const deletedSubscription = await stripe.subscriptions.del(subscriptionId);
//     res.json({ subscription: deletedSubscription });
//   } catch (error) {
//     console.error('Error cancelling subscription:', error);
//     res.status(500).json({ error: 'Failed to cancel subscription' });
//   }
// });

// router.post('/cancel-subscription-item', async (req: Request, res: Response) => {
//   try {
//     const { subscriptionId, classId } = req.body;
//     if (!subscriptionId || !classId) {
//       return res.status(400).json({ error: 'Subscription ID and Class ID are required' });
//     }

//     // Fetch price_id from class table
//     const classData = await prisma.class.findUnique({
//       where: { class_id: classId },
//       select: { price_id: true },
//     });

//     if (!classData?.price_id) {
//       return res.status(404).json({ error: 'Price not found for this class' });
//     }

//     const priceId = classData.price_id;

//     // Fetch subscription from Stripe
//     const subscription = await stripe.subscriptions.retrieve(subscriptionId);

//     // Find the subscription item that matches the priceId
//     const item = subscription.items.data.find(i => i.price.id === priceId);
//     if (!item) {
//       return res.status(404).json({ error: 'Subscription item not found for this class' });
//     }

//     // Delete the subscription item (unsubscribes this product)
//     const deletedItem = await stripe.subscriptionItems.del(item.id);

//     res.json({ subscriptionItem: deletedItem });

//   } catch (error) {
//     console.error('Error cancelling subscription item:', error);
//     res.status(500).json({ error: 'Failed to cancel subscription item' });
//   }
// });


export default router;



