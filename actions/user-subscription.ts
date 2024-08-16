"use server";

import { auth, currentUser } from "@clerk/nextjs/server";

import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { getUserSubscription } from "@/db/queries";

const returnUrl = absoluteUrl("/shop");

export const createStripeUrl = async () => {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
        throw new Error("Unauthorized");
    }

    const userSubsciption = await getUserSubscription();

    if(userSubsciption && userSubsciption.stripeCustomerId) {
        const stripeSession = await stripe.billingPortal.sessions.create({
            customer: userSubsciption.stripeCustomerId,
            return_url: returnUrl,
        })

        return { data: stripeSession.url }
    }

    const stripeSession = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer_email: user.emailAddresses[0].emailAddress,
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency: "USD",
                    product_data: {
                        name: "Duolingo Pro",
                        description: "Unlimited Hearts",
                    },
                    unit_amount: 2000, // $20.00
                    recurring: {
                        interval: "month",
                    }
                }
            }
        ],
        metadata: {
            userId,
        },
        success_url: returnUrl,
        cancel_url: returnUrl,
    });

    return { data: stripeSession.url };
}