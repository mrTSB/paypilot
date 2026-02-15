'use client'

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PayPilotLogoFull } from '@/components/logo'
import {
  Users,
  Calculator,
  Clock,
  Shield,
  MessageSquare,
  Zap,
  Check,
  Loader2,
  ArrowRight
} from "lucide-react"

const features = [
  {
    icon: Calculator,
    title: "Automated Payroll",
    description: "Run payroll in minutes with automatic calculations"
  },
  {
    icon: Users,
    title: "Employee Management",
    description: "Manage all HR data in one central place"
  },
  {
    icon: Clock,
    title: "Time & Attendance",
    description: "Track hours and sync directly to payroll"
  },
  {
    icon: Shield,
    title: "Benefits Admin",
    description: "Manage health, dental, and 401(k) enrollment"
  },
  {
    icon: MessageSquare,
    title: "AI HR Assistant",
    description: "Get instant answers about policies and benefits"
  },
  {
    icon: Zap,
    title: "Compliance Built-In",
    description: "Stay compliant with automatic updates"
  }
]

const pricingPlans = [
  {
    name: "Starter",
    price: 40,
    planId: "starter",
    description: "For small teams getting started",
    features: [
      "Up to 10 employees",
      "Full payroll processing",
      "Basic HR tools",
      "Email support"
    ]
  },
  {
    name: "Growth",
    price: 80,
    planId: "growth",
    description: "For growing businesses",
    popular: true,
    features: [
      "Up to 50 employees",
      "Everything in Starter",
      "Benefits administration",
      "AI HR Assistant",
      "Priority support"
    ]
  },
  {
    name: "Enterprise",
    price: 150,
    planId: "enterprise",
    description: "For larger organizations",
    features: [
      "Unlimited employees",
      "Everything in Growth",
      "Custom integrations",
      "Dedicated account manager",
      "Advanced analytics"
    ]
  }
]

export default function LandingPage() {
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  const handleCheckout = async (planId: string) => {
    setCheckoutLoading(planId)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planId,
          // Email will be collected by Stripe checkout
        })
      })

      const data = await response.json()

      if (data.error) {
        console.error('Checkout API error:', data.error)
        // Fallback to signup page on error
        window.location.href = `/signup?plan=${planId}`
        return
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        // No URL returned, go to signup
        window.location.href = `/signup?plan=${planId}`
      }
    } catch (error) {
      console.error('Checkout error:', error)
      // Fallback to signup page
      window.location.href = `/signup?plan=${planId}`
    }
    // Don't reset loading since we're navigating away
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between h-16 items-center">
            <PayPilotLogoFull />
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-sm">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4 tracking-tight">
            Payroll and HR that runs itself
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Modern payroll and HR platform with AI at its core
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-16 bg-secondary">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">
            Everything you need
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border border-border bg-white">
                <CardContent className="p-6">
                  <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center mb-3">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Simple pricing
            </h2>
            <p className="text-muted-foreground">
              Start free, scale as you grow
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`border ${
                  plan.popular
                    ? 'border-primary bg-white'
                    : 'border-border bg-secondary'
                }`}
              >
                <CardContent className="p-6">
                  {plan.popular && (
                    <div className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full w-fit mb-3">
                      Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {plan.description}
                  </p>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-foreground">
                      ${plan.price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      /mo + $6/employee
                    </span>
                  </div>
                  <Button
                    className={`w-full mb-4 ${
                      plan.popular
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-white border border-border hover:bg-secondary'
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handleCheckout(plan.planId)}
                    disabled={checkoutLoading !== null}
                  >
                    {checkoutLoading === plan.planId ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Start 14-Day Trial'
                    )}
                  </Button>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-3">
            Ready to transform your HR?
          </h2>
          <p className="text-lg text-white/90 mb-6">
            Join companies using PayPilot to simplify HR and payroll
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              Start Your Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <PayPilotLogoFull className="mb-3" />
              <p className="text-sm text-muted-foreground max-w-xs">
                AI-native HR and payroll platform built for modern teams
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">
                Product
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">
                Company
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                    About
                  </span>
                </li>
                <li>
                  <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                    Privacy
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6">
            <p className="text-sm text-muted-foreground text-center">
              © 2026 PayPilot. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
