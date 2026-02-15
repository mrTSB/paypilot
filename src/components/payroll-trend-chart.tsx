'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// Static demo data - 12 months of payroll expense
// Realistic pattern: steady growth with seasonal variations
const PAYROLL_TREND_DATA = [
  { month: 'Mar', amount: 485000, employees: 42 },
  { month: 'Apr', amount: 492000, employees: 42 },
  { month: 'May', amount: 498000, employees: 43 },
  { month: 'Jun', amount: 512000, employees: 44 },
  { month: 'Jul', amount: 508000, employees: 44 }, // Summer dip
  { month: 'Aug', amount: 515000, employees: 44 },
  { month: 'Sep', amount: 535000, employees: 45 }, // Fall hiring
  { month: 'Oct', amount: 548000, employees: 46 },
  { month: 'Nov', amount: 552000, employees: 46 },
  { month: 'Dec', amount: 565000, employees: 46 }, // Year-end bonuses reflected
  { month: 'Jan', amount: 558000, employees: 46 }, // Post-holiday normalization
  { month: 'Feb', amount: 572000, employees: 47 }, // Current month
]

// Calculate MoM change
const calculateMoMChange = () => {
  const current = PAYROLL_TREND_DATA[PAYROLL_TREND_DATA.length - 1].amount
  const previous = PAYROLL_TREND_DATA[PAYROLL_TREND_DATA.length - 2].amount
  const change = ((current - previous) / previous) * 100
  return {
    percent: Math.abs(change).toFixed(1),
    isPositive: change >= 0,
    direction: change >= 0 ? 'up' : 'down',
  }
}

// Custom tooltip component
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload: { employees: number } }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium text-foreground">{label} 2026</p>
        <p className="text-primary font-semibold">
          ${payload[0].value.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">
          {payload[0].payload.employees} employees
        </p>
      </div>
    )
  }
  return null
}

export function PayrollTrendChart() {
  const momChange = calculateMoMChange()
  const currentMonth = PAYROLL_TREND_DATA[PAYROLL_TREND_DATA.length - 1]

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Monthly Payroll Expense</CardTitle>
            <CardDescription>Last 12 months trend</CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">
                ${(currentMonth.amount / 1000).toFixed(0)}K
              </span>
              <Badge
                variant="outline"
                className={momChange.isPositive
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
                }
              >
                {momChange.isPositive ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {momChange.percent}% MoM
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentMonth.employees} employees
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={PAYROLL_TREND_DATA}
              margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: '#737373' }}
                axisLine={{ stroke: '#e5e5e5' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#737373' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${value / 1000}K`}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#3A7139"
                strokeWidth={2.5}
                dot={{ fill: '#3A7139', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 6, fill: '#3A7139', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t text-sm">
          <div>
            <span className="text-muted-foreground">YTD Total: </span>
            <span className="font-semibold text-foreground">
              ${(PAYROLL_TREND_DATA.slice(-2).reduce((sum, m) => sum + m.amount, 0) / 1000).toFixed(0)}K
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Avg Monthly: </span>
            <span className="font-semibold text-foreground">
              ${(PAYROLL_TREND_DATA.reduce((sum, m) => sum + m.amount, 0) / PAYROLL_TREND_DATA.length / 1000).toFixed(0)}K
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">12mo Growth: </span>
            <span className="font-semibold text-green-600">
              +{(((PAYROLL_TREND_DATA[11].amount - PAYROLL_TREND_DATA[0].amount) / PAYROLL_TREND_DATA[0].amount) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
