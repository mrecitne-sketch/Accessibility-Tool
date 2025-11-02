import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  const supabase = await createAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (!userId) {
          console.error('No userId in session metadata');
          break;
        }

        // Get the subscription from the session
        const subscriptionId = session.subscription;

        if (subscriptionId && typeof subscriptionId === 'string') {
          // Update user to pro tier
          await supabase
            .from('users')
            .update({
              subscription_tier: 'pro',
              stripe_subscription_id: subscriptionId,
            })
            .eq('id', userId);
        }

        console.log('Subscription activated for user:', userId);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          // Try to find user by customer ID
          const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('stripe_customer_id', subscription.customer)
            .single();

          if (user) {
            await supabase
              .from('users')
              .update({
                subscription_tier: 'free',
                stripe_subscription_id: null,
              })
              .eq('id', user.id);
          }
          break;
        }

        // Downgrade user to free tier
        await supabase
          .from('users')
          .update({
            subscription_tier: 'free',
            stripe_subscription_id: null,
          })
          .eq('id', userId);

        console.log('Subscription canceled for user:', userId);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer;

        if (typeof customerId === 'string') {
          // Find user by customer ID
          const { data: user } = await supabase
            .from('users')
            .select('id, email')
            .eq('stripe_customer_id', customerId)
            .single();

          if (user) {
            console.log('Payment failed for user:', user.email);
            // You could send an email notification here
            // For now, we'll just log it
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Note: Edge runtime doesn't support raw body well, so we use Node.js runtime
export const runtime = 'nodejs';

