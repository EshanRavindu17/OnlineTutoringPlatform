import Stripe from "stripe";
import  prisma  from "../prismaClient";
import  {DateTime} from "luxon";


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

  const time = DateTime.now().setZone("Asia/Colombo").toJSDate();

  console.log("Payment data received in service:", paymentData);

  try {
    const paymentRecord = await prisma.individual_Payments.create({
      data: {
        ...paymentData,
        payment_date_time: time,
      },
    });
    return paymentRecord;
  } catch (error) {
    console.error("Error creating payment record:", error);
    throw error;
  }
};



export const refundPayment = async (paymentIntentId: string, amount?: number) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount, // Optional: partial refund if specified, full refund if not
    });
    return refund;
  } catch (error) {
    console.error("Error processing refund:", error);
    throw error;
  }
};
