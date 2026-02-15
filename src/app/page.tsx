'use client'

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
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
  ArrowRight,
} from "lucide-react"

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 }
}

const features = [
  {
    icon: Calculator,
    title: "Automated Payroll",
    description: "Run payroll in minutes with automatic tax calculations and direct deposits"
  },
  {
    icon: Users,
    title: "Employee Management",
    description: "Centralize all HR data, from onboarding to offboarding"
  },
  {
    icon: Clock,
    title: "Time & Attendance",
    description: "Track hours, PTO, and sync everything directly to payroll"
  },
  {
    icon: Shield,
    title: "Benefits Administration",
    description: "Manage health, dental, vision, and 401(k) enrollment seamlessly"
  },
  {
    icon: MessageSquare,
    title: "AI HR Assistant",
    description: "Get instant answers about policies, benefits, and compliance"
  },
  {
    icon: Zap,
    title: "Compliance Built-In",
    description: "Stay compliant with automatic regulatory updates"
  }
]

const pricingPlans = [
  {
    name: "Starter",
    price: 49,
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
    price: 149,
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
    price: 449,
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
        body: JSON.stringify({ plan: planId })
      })

      const data = await response.json()

      if (data.error) {
        console.error('Checkout API error:', data.error)
        window.location.href = `/signup?plan=${planId}`
        return
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        window.location.href = `/signup?plan=${planId}`
      }
    } catch (error) {
      console.error('Checkout error:', error)
      window.location.href = `/signup?plan=${planId}`
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <motion.nav
        className="border-b border-border bg-white sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
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
      </motion.nav>

      {/* Hero Section */}
      <section className="px-6 pt-16 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.h1
                className="text-5xl md:text-6xl font-bold text-foreground mb-4 tracking-tight"
                variants={fadeInUp}
              >
                Payroll and HR
                <br />
                <span className="text-primary">that runs itself</span>
              </motion.h1>
              <motion.p
                className="text-xl text-muted-foreground mb-8 max-w-lg"
                variants={fadeInUp}
              >
                The modern payroll and HR platform with AI at its core.
                Automate the busywork. Focus on your people.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-3"
                variants={fadeInUp}
              >
                <Link href="/signup">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Start Free Trial
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="border-border hover:bg-secondary">
                    See How It Works
                  </Button>
                </Link>
              </motion.div>
              <motion.p
                className="text-sm text-muted-foreground mt-4"
                variants={fadeInUp}
              >
                No credit card required · 14-day free trial
              </motion.p>
            </motion.div>

            {/* Right: Hero Image */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative rounded-xl overflow-hidden border border-border bg-white">
                <Image
                  src="/images/hero-dashboard.png"
                  alt="PayPilot Dashboard"
                  width={800}
                  height={500}
                  className="w-full h-auto"
                  priority
                />
              </div>
              {/* Floating notification */}
              <motion.div
                className="absolute -left-4 bottom-8 bg-white rounded-lg border border-border p-3 hidden lg:block"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">Payroll Complete</p>
                    <p className="text-xs text-muted-foreground">47 employees paid</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-16 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              { value: "10k+", label: "Employees Managed" },
              { value: "99.9%", label: "Uptime" },
              { value: "$2M+", label: "Payroll Processed" },
              { value: "4.9★", label: "Customer Rating" }
            ].map((stat) => (
              <motion.div
                key={stat.label}
                className="text-center"
                variants={fadeInUp}
              >
                <p className="text-3xl font-bold text-primary mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-secondary">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2
              className="text-3xl font-bold text-foreground mb-4 text-center"
              variants={fadeInUp}
            >
              Everything you need
            </motion.h2>
            <motion.p
              className="text-muted-foreground text-center mb-12 max-w-xl mx-auto"
              variants={fadeInUp}
            >
              From payroll to benefits to compliance, PayPilot handles it all so you can focus on growing your business.
            </motion.p>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
            >
              {features.map((feature) => (
                <motion.div key={feature.title} variants={scaleIn}>
                  <Card className="border border-border bg-white h-full hover:border-primary/50 transition-colors">
                    <CardContent className="p-6">
                      <motion.div
                        className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <feature.icon className="w-6 h-6 text-primary" />
                      </motion.div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section with Image */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Image */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="rounded-xl overflow-hidden border border-border">
                <Image
                  src="/images/payroll-illustration.png"
                  alt="Automated Payroll Processing"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
            </motion.div>

            {/* Right: Text */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.h2
                className="text-3xl font-bold text-foreground mb-4"
                variants={fadeInUp}
              >
                Payroll that takes minutes, not hours
              </motion.h2>
              <motion.p
                className="text-muted-foreground mb-6"
                variants={fadeInUp}
              >
                Run payroll in just a few clicks. PayPilot automatically calculates taxes, deductions, and generates pay stubs. Direct deposits happen on schedule, every time.
              </motion.p>
              <motion.ul className="space-y-3" variants={staggerContainer}>
                {[
                  "Automatic tax calculations and filings",
                  "Direct deposit to any bank",
                  "Handles contractors and employees",
                  "Year-end tax forms generated automatically"
                ].map((item) => (
                  <motion.li
                    key={item}
                    className="flex items-start gap-2 text-muted-foreground"
                    variants={fadeInUp}
                  >
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    {item}
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section with Image */}
      <section className="px-6 py-20 bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="order-2 lg:order-1"
            >
              <motion.h2
                className="text-3xl font-bold text-foreground mb-4"
                variants={fadeInUp}
              >
                Your entire team, one platform
              </motion.h2>
              <motion.p
                className="text-muted-foreground mb-6"
                variants={fadeInUp}
              >
                From onboarding to offboarding, manage your entire employee lifecycle in one place. Track PTO, manage benefits enrollment, and keep everyone informed.
              </motion.p>
              <motion.ul className="space-y-3" variants={staggerContainer}>
                {[
                  "Self-service employee portal",
                  "Org chart and directory",
                  "Document storage and e-signatures",
                  "Performance tracking and reviews"
                ].map((item) => (
                  <motion.li
                    key={item}
                    className="flex items-start gap-2 text-muted-foreground"
                    variants={fadeInUp}
                  >
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    {item}
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>

            {/* Right: Image */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <div className="rounded-xl overflow-hidden border border-border">
                <Image
                  src="/images/team-illustration.png"
                  alt="Team Collaboration"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div className="text-center mb-12" variants={fadeInUp}>
              <h2 className="text-3xl font-bold text-foreground mb-3">
                Simple, transparent pricing
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Start free for 14 days. No credit card required. Scale as you grow.
              </p>
            </motion.div>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
              variants={staggerContainer}
            >
              {pricingPlans.map((plan) => (
                <motion.div key={plan.name} variants={scaleIn}>
                  <Card
                    className={`border h-full ${
                      plan.popular
                        ? 'border-primary bg-white relative'
                        : 'border-border bg-card'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-foreground mb-1">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {plan.description}
                      </p>
                      <div className="mb-6">
                        <span className="text-4xl font-bold text-foreground">
                          ${plan.price}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /month
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                          + $6 per employee
                        </p>
                      </div>
                      <Button
                        className={`w-full mb-6 ${
                          plan.popular
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
                        }`}
                        onClick={() => handleCheckout(plan.planId)}
                        disabled={checkoutLoading !== null}
                      >
                        {checkoutLoading === plan.planId ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Start Free Trial'
                        )}
                      </Button>
                      <ul className="space-y-3">
                        {plan.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        className="px-6 py-20 bg-primary"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            className="text-3xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Ready to transform your HR?
          </motion.h2>
          <motion.p
            className="text-lg text-white/90 mb-8 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Join thousands of companies using PayPilot to simplify HR and payroll operations.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/signup">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Start Your Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <PayPilotLogoFull className="mb-4" />
              <p className="text-sm text-muted-foreground max-w-xs">
                AI-native HR and payroll platform built for modern teams. Automate the busywork. Focus on your people.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">
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
                <li>
                  <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                    Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">
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
                <li>
                  <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                    Terms
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8">
            <p className="text-sm text-muted-foreground text-center">
              © 2026 PayPilot. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
