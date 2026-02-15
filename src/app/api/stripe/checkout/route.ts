import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe with API key
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

// Price IDs for each plan (would be created in Stripe Dashboard)
const PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER || 'price_starter_monthly',
  growth: process.env.STRIPE_PRICE_GROWTH || 'price_growth_monthly',
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_monthly'
}

export async function POST(req: NextRequest) {
  try {
    const { plan, email, companyName } = await req.json()

    // Validate required fields
    if (!plan || !email) {
      return NextResponse.json(
        { error: 'Plan and email are required' },
        { status: 400 }
      )
    }

    // Get price ID for the selected plan
    const priceId = PRICE_IDS[plan]
    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    // If no Stripe key, return demo response
    if (!stripe) {
      console.log('Stripe not configured, returning demo checkout URL')
      return NextResponse.json({
        url: `/signup?plan=${plan}&email=${encodeURIComponent(email)}&demo=true`,
        mode: 'demo'
      })
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      customer_email: email,
      metadata: {
        company_name: companyName || '',
        plan: plan
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://paypilot-one.vercel.app'}/signup?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://paypilot-one.vercel.app'}/?canceled=true`,
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          company_name: companyName || '',
          plan: plan
        }
      }
    })

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      mode: 'live'
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)

    // Return user-friendly error
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
