'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar } from '@/components/ui/calendar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Clock,
  Calendar as CalendarIcon,
  Plus,
  CheckCircle2,
  XCircle,
  Hourglass,
  Sun,
  Plane,
  Stethoscope,
  Users
} from 'lucide-react'

// Demo PTO requests
const ptoRequests = [
  { id: '1', employee: 'Sarah Chen', avatar: 'SC', type: 'pto', startDate: 'Feb 24, 2026', endDate: 'Feb 26, 2026', hours: 24, reason: 'Family vacation', status: 'pending' },
  { id: '2', employee: 'Tom Wilson', avatar: 'TW', type: 'pto', startDate: 'Mar 3, 2026', endDate: 'Mar 7, 2026', hours: 40, reason: 'Spring break trip', status: 'pending' },
  { id: '3', employee: 'Emily Davis', avatar: 'ED', type: 'sick', startDate: 'Feb 10, 2026', endDate: 'Feb 10, 2026', hours: 8, reason: 'Doctor appointment', status: 'approved' },
  { id: '4', employee: 'Lisa Park', avatar: 'LP', type: 'pto', startDate: 'Jan 20, 2026', endDate: 'Jan 24, 2026', hours: 40, reason: 'Personal time', status: 'approved' },
  { id: '5', employee: 'Alex Wong', avatar: 'AW', type: 'pto', startDate: 'Feb 1, 2026', endDate: 'Feb 2, 2026', hours: 16, reason: 'Moving to new apartment', status: 'denied' },
]

// Demo time entries for current week
const timeEntries = [
  { day: 'Mon', date: 'Feb 10', clockIn: '9:00 AM', clockOut: '5:30 PM', breakMin: 30, totalHours: 8.0 },
  { day: 'Tue', date: 'Feb 11', clockIn: '8:45 AM', clockOut: '6:00 PM', breakMin: 45, totalHours: 8.5 },
  { day: 'Wed', date: 'Feb 12', clockIn: '9:15 AM', clockOut: '5:45 PM', breakMin: 30, totalHours: 8.0 },
  { day: 'Thu', date: 'Feb 13', clockIn: '9:00 AM', clockOut: '6:30 PM', breakMin: 60, totalHours: 8.5 },
  { day: 'Fri', date: 'Feb 14', clockIn: '9:00 AM', clockOut: '-', breakMin: 0, totalHours: 4.0 },
]

// Employee PTO balances
const ptoBalances = [
  { id: '1', name: 'Sarah Chen', avatar: 'SC', ptoBalance: 96, ptoUsed: 24, sickBalance: 32, sickUsed: 8 },
  { id: '2', name: 'Mike Johnson', avatar: 'MJ', ptoBalance: 120, ptoUsed: 0, sickBalance: 40, sickUsed: 0 },
  { id: '3', name: 'Emily Davis', avatar: 'ED', ptoBalance: 88, ptoUsed: 32, sickBalance: 32, sickUsed: 8 },
  { id: '4', name: 'Tom Wilson', avatar: 'TW', ptoBalance: 72, ptoUsed: 48, sickBalance: 24, sickUsed: 16 },
  { id: '5', name: 'Lisa Park', avatar: 'LP', ptoBalance: 80, ptoUsed: 40, sickBalance: 40, sickUsed: 0 },
]

export default function TimePage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700"><Hourglass className="w-3 h-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge className="bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>
      case 'denied':
        return <Badge className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" />Denied</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pto':
        return <Plane className="w-4 h-4 text-blue-500" />
      case 'sick':
        return <Stethoscope className="w-4 h-4 text-red-500" />
      default:
        return <Sun className="w-4 h-4 text-amber-500" />
    }
  }

  const pendingRequests = ptoRequests.filter(r => r.status === 'pending')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Time & PTO</h1>
          <p className="text-slate-600">Track time, manage PTO requests, and view balances</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Clock className="w-4 h-4 mr-2" />
            Clock In
          </Button>
          <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Request Time Off
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Request Time Off</DialogTitle>
                <DialogDescription>
                  Submit a new PTO or leave request for approval.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Request Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pto">PTO (Vacation)</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                      <SelectItem value="bereavement">Bereavement</SelectItem>
                      <SelectItem value="jury_duty">Jury Duty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason (Optional)</Label>
                  <Textarea id="reason" placeholder="Brief description..." />
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Your PTO Balance:</strong> 96 hours (12 days) remaining
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>Cancel</Button>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">Submit Request</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Sun className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">96</p>
                <p className="text-sm text-slate-500">PTO Hours Left</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">32</p>
                <p className="text-sm text-slate-500">Sick Hours Left</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Hourglass className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{pendingRequests.length}</p>
                <p className="text-sm text-slate-500">Pending Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">37.0</p>
                <p className="text-sm text-slate-500">Hours This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time Tracking & Requests */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="requests" className="space-y-4">
            <TabsList>
              <TabsTrigger value="requests">PTO Requests</TabsTrigger>
              <TabsTrigger value="timesheet">My Timesheet</TabsTrigger>
              <TabsTrigger value="balances">Team Balances</TabsTrigger>
            </TabsList>

            <TabsContent value="requests">
              <Card>
                <CardHeader>
                  <CardTitle>PTO Requests</CardTitle>
                  <CardDescription>Review and manage time off requests</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ptoRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                  {request.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{request.employee}</p>
                                <p className="text-xs text-slate-500">{request.reason}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(request.type)}
                              <span className="capitalize">{request.type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {request.startDate} - {request.endDate}
                            </span>
                          </TableCell>
                          <TableCell>{request.hours}h</TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>
                            {request.status === 'pending' && (
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                  <XCircle className="w-4 h-4" />
                                </Button>
                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                  <CheckCircle2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timesheet">
              <Card>
                <CardHeader>
                  <CardTitle>This Week&apos;s Timesheet</CardTitle>
                  <CardDescription>Feb 10 - Feb 14, 2026</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Day</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Clock In</TableHead>
                        <TableHead>Clock Out</TableHead>
                        <TableHead>Break</TableHead>
                        <TableHead className="text-right">Total Hours</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeEntries.map((entry, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{entry.day}</TableCell>
                          <TableCell>{entry.date}</TableCell>
                          <TableCell>{entry.clockIn}</TableCell>
                          <TableCell>{entry.clockOut}</TableCell>
                          <TableCell>{entry.breakMin > 0 ? `${entry.breakMin} min` : '-'}</TableCell>
                          <TableCell className="text-right font-medium">{entry.totalHours.toFixed(1)}h</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-slate-50">
                        <TableCell colSpan={5} className="font-semibold">Week Total</TableCell>
                        <TableCell className="text-right font-bold text-blue-600">37.0h</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="balances">
              <Card>
                <CardHeader>
                  <CardTitle>Team PTO Balances</CardTitle>
                  <CardDescription>View PTO and sick leave balances for all employees</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead className="text-right">PTO Balance</TableHead>
                        <TableHead className="text-right">PTO Used</TableHead>
                        <TableHead className="text-right">Sick Balance</TableHead>
                        <TableHead className="text-right">Sick Used</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ptoBalances.map((emp) => (
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
                          <TableCell className="text-right font-medium text-blue-600">{emp.ptoBalance}h</TableCell>
                          <TableCell className="text-right text-slate-500">{emp.ptoUsed}h</TableCell>
                          <TableCell className="text-right font-medium text-red-600">{emp.sickBalance}h</TableCell>
                          <TableCell className="text-right text-slate-500">{emp.sickUsed}h</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Calendar Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Calendar</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Who&apos;s Out</CardTitle>
              <CardDescription>Team members on leave this week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-2 bg-amber-50 rounded-lg">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-amber-100 text-amber-700 text-xs">RK</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Rachel Kim</p>
                  <p className="text-xs text-slate-500">On leave until Feb 21</p>
                </div>
              </div>
              <div className="text-center py-4 text-slate-500">
                <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No other team members out</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
