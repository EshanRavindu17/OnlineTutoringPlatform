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


// for create a strype product and price for mass class subscription
export const createStripeProductAndPrice = async (tutorId: number, tutorName: string, monthlyRate: number) => {
  try {
    // Create a product
    const product = await stripe.products.create({
      name: `Mass Class Subscription - ${tutorName}`,
      description: `Monthly subscription for mass classes by ${tutorName}`,
      metadata: {
        tutorId: tutorId.toString(),
      },
    });
    // Create a price for the product
    const price = await stripe.prices.create({
      unit_amount: monthlyRate * 100, // Amount in cents
      currency: 'usd',
      recurring: { interval: 'month' },
      product: product.id,
    });
    return { product, price };
  } catch (error) {
    console.error("Error creating Stripe product and price:", error);
    throw error;
  }
};
