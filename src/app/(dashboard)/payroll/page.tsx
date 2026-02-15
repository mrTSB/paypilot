'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Calculator,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Download,
  Play,
  FileText
} from 'lucide-react'

// Demo payroll data
const payrollRuns = [
  {
    id: '1',
    payPeriod: 'Feb 2-15, 2026',
    payDate: 'Feb 20, 2026',
    employees: 47,
    grossPay: 124850,
    taxes: 31212,
    deductions: 18727,
    netPay: 74911,
    status: 'pending_approval'
  },
  {
    id: '2',
    payPeriod: 'Jan 19 - Feb 1, 2026',
    payDate: 'Feb 6, 2026',
    employees: 46,
    grossPay: 121500,
    taxes: 30375,
    deductions: 18225,
    netPay: 72900,
    status: 'completed'
  },
  {
    id: '3',
    payPeriod: 'Jan 5-18, 2026',
    payDate: 'Jan 23, 2026',
    employees: 45,
    grossPay: 118200,
    taxes: 29550,
    deductions: 17730,
    netPay: 70920,
    status: 'completed'
  }
]

const currentPayrollEmployees = [
  { id: '1', name: 'Sarah Chen', avatar: 'SC', department: 'Engineering', regularHours: 80, overtimeHours: 4, grossPay: 6250, taxes: 1562, deductions: 937, netPay: 3751 },
  { id: '2', name: 'Mike Johnson', avatar: 'MJ', department: 'Engineering', regularHours: 80, overtimeHours: 0, grossPay: 3654, taxes: 913, deductions: 548, netPay: 2193 },
  { id: '3', name: 'Emily Davis', avatar: 'ED', department: 'Design', regularHours: 80, overtimeHours: 2, grossPay: 4423, taxes: 1106, deductions: 663, netPay: 2654 },
  { id: '4', name: 'Tom Wilson', avatar: 'TW', department: 'Sales', regularHours: 80, overtimeHours: 8, grossPay: 3846, taxes: 961, deductions: 577, netPay: 2308 },
  { id: '5', name: 'Lisa Park', avatar: 'LP', department: 'Sales', regularHours: 80, overtimeHours: 0, grossPay: 5000, taxes: 1250, deductions: 750, netPay: 3000 },
  { id: '6', name: 'Alex Wong', avatar: 'AW', department: 'Marketing', regularHours: 80, overtimeHours: 0, grossPay: 2885, taxes: 721, deductions: 433, netPay: 1731 },
]

export default function PayrollPage() {
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [selectedPayroll, setSelectedPayroll] = useState<typeof payrollRuns[0] | null>(null)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>
      case 'calculating':
        return <Badge className="bg-blue-100 text-blue-700">Calculating</Badge>
      case 'pending_approval':
        return <Badge className="bg-amber-100 text-amber-700">Pending Approval</Badge>
      case 'approved':
        return <Badge className="bg-emerald-100 text-emerald-700">Approved</Badge>
      case 'processing':
        return <Badge className="bg-violet-100 text-violet-700">Processing</Badge>
      case 'completed':
        return <Badge className="bg-emerald-100 text-emerald-700">Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleApprove = (payroll: typeof payrollRuns[0]) => {
    setSelectedPayroll(payroll)
    setApproveDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payroll</h1>
          <p className="text-slate-600">Manage payroll runs and view payment history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Reports
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Play className="w-4 h-4 mr-2" />
            Run Payroll
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">$124,850</p>
                <p className="text-sm text-slate-500">Next Payroll</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">47</p>
                <p className="text-sm text-slate-500">Employees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">Feb 20</p>
                <p className="text-sm text-slate-500">Next Pay Date</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">$487K</p>
                <p className="text-sm text-slate-500">YTD Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Payroll Card */}
      <Card className="border-2 border-amber-200 bg-amber-50/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <CardTitle>Payroll Pending Approval</CardTitle>
                <CardDescription>Pay period: Feb 2-15, 2026 | Pay date: Feb 20, 2026</CardDescription>
              </div>
            </div>
            <Button onClick={() => handleApprove(payrollRuns[0])} className="bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approve & Submit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-white rounded-lg border">
              <p className="text-sm text-slate-500">Gross Pay</p>
              <p className="text-xl font-semibold text-slate-900">$124,850</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <p className="text-sm text-slate-500">Total Taxes</p>
              <p className="text-xl font-semibold text-red-600">-$31,212</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <p className="text-sm text-slate-500">Deductions</p>
              <p className="text-xl font-semibold text-amber-600">-$18,727</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-emerald-200 bg-emerald-50">
              <p className="text-sm text-emerald-600">Net Pay</p>
              <p className="text-xl font-semibold text-emerald-700">$74,911</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-700">Payroll Progress</p>
              <p className="text-sm text-slate-500">47 of 47 employees calculated</p>
            </div>
            <Progress value={100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs for current payroll details and history */}
      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">Current Run Details</TabsTrigger>
          <TabsTrigger value="history">Payroll History</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <Card>
            <CardHeader>
              <CardTitle>Employee Breakdown</CardTitle>
              <CardDescription>Detailed pay information for each employee</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Regular Hrs</TableHead>
                    <TableHead className="text-right">OT Hrs</TableHead>
                    <TableHead className="text-right">Gross Pay</TableHead>
                    <TableHead className="text-right">Taxes</TableHead>
                    <TableHead className="text-right">Deductions</TableHead>
                    <TableHead className="text-right">Net Pay</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPayrollEmployees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                              {emp.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{emp.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell className="text-right">{emp.regularHours}</TableCell>
                      <TableCell className="text-right">
                        {emp.overtimeHours > 0 ? (
                          <span className="text-amber-600 font-medium">{emp.overtimeHours}</span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">${emp.grossPay.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-red-600">-${emp.taxes.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-amber-600">-${emp.deductions.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-semibold text-emerald-600">${emp.netPay.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Payroll History</CardTitle>
              <CardDescription>View past payroll runs and download reports</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pay Period</TableHead>
                    <TableHead>Pay Date</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead className="text-right">Gross Pay</TableHead>
                    <TableHead className="text-right">Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollRuns.map((run) => (
                    <TableRow key={run.id}>
                      <TableCell className="font-medium">{run.payPeriod}</TableCell>
                      <TableCell>{run.payDate}</TableCell>
                      <TableCell>{run.employees}</TableCell>
                      <TableCell className="text-right">${run.grossPay.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium text-emerald-600">
                        ${run.netPay.toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(run.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Payroll</DialogTitle>
            <DialogDescription>
              You are about to approve the payroll for {selectedPayroll?.payPeriod}.
              This action will initiate payment processing.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Employees</span>
                <span className="font-medium">{selectedPayroll?.employees}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total Gross Pay</span>
                <span className="font-medium">${selectedPayroll?.grossPay.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total Net Pay</span>
                <span className="font-semibold text-emerald-600">${selectedPayroll?.netPay.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Pay Date</span>
                <span className="font-medium">{selectedPayroll?.payDate}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approve & Process
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
