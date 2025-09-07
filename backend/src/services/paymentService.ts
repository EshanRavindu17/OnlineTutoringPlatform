import Stripe from "stripe";
import  prisma  from "../prismaClient";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


const createPaymentIntent = async (amount: number, currency: string) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });
    return paymentIntent;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
};


export const createPaymentRecord = async (paymentData: {}) => {

  try {
    const paymentRecord = await prisma.individual_Payments.create({
      data: {
        ...paymentData,
        payment_date_time: new Date(), // ensure correct field name
      },
    });
    return paymentRecord;
  } catch (error) {
    console.error("Error creating payment record:", error);
    throw error;
  }
};
