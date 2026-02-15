// State Machine Definitions for PayPilot
// These define valid state transitions with guards and side effects

// =============================================================================
// EMPLOYEE STATE MACHINE
// =============================================================================
export type EmployeeStatus = 'invited' | 'onboarding' | 'active' | 'on_leave' | 'terminated'

export interface EmployeeTransition {
  from: EmployeeStatus[]
  to: EmployeeStatus
  trigger: string
  guard?: (context: EmployeeContext) => boolean
  effect?: (context: EmployeeContext) => void
}

export interface EmployeeContext {
  employeeId: string
  currentStatus: EmployeeStatus
  hasCompletedOnboarding?: boolean
  terminationReason?: string
  actorRole?: 'admin' | 'employee' | 'system'
}

export const employeeTransitions: EmployeeTransition[] = [
  {
    from: ['invited'],
    to: 'onboarding',
    trigger: 'ACCEPT_INVITE',
    guard: (ctx) => ctx.actorRole === 'employee' || ctx.actorRole === 'system',
  },
  {
    from: ['onboarding'],
    to: 'active',
    trigger: 'COMPLETE_ONBOARDING',
    guard: (ctx) => ctx.hasCompletedOnboarding === true,
  },
  {
    from: ['active'],
    to: 'on_leave',
    trigger: 'START_LEAVE',
    guard: (ctx) => ctx.actorRole === 'admin' || ctx.actorRole === 'system',
  },
  {
    from: ['on_leave'],
    to: 'active',
    trigger: 'END_LEAVE',
    guard: (ctx) => ctx.actorRole === 'admin' || ctx.actorRole === 'system',
  },
  {
    from: ['active', 'on_leave', 'onboarding'],
    to: 'terminated',
    trigger: 'TERMINATE',
    guard: (ctx) => ctx.actorRole === 'admin' && !!ctx.terminationReason,
  },
]

export function canTransitionEmployee(
  currentStatus: EmployeeStatus,
  targetStatus: EmployeeStatus,
  context: Partial<EmployeeContext>
): { allowed: boolean; reason?: string } {
  const transition = employeeTransitions.find(
    (t) => t.from.includes(currentStatus) && t.to === targetStatus
  )

  if (!transition) {
    return { allowed: false, reason: `Invalid transition from ${currentStatus} to ${targetStatus}` }
  }

  const fullContext: EmployeeContext = {
    employeeId: context.employeeId || '',
    currentStatus,
    ...context,
  }

  if (transition.guard && !transition.guard(fullContext)) {
    return { allowed: false, reason: 'Transition guard failed' }
  }

  return { allowed: true }
}

// =============================================================================
// PAYROLL RUN STATE MACHINE
// =============================================================================
export type PayrollStatus = 'draft' | 'calculating' | 'pending_approval' | 'approved' | 'processing' | 'completed' | 'failed'

export interface PayrollTransition {
  from: PayrollStatus[]
  to: PayrollStatus
  trigger: string
  guard?: (context: PayrollContext) => boolean
}

export interface PayrollContext {
  payrollId: string
  currentStatus: PayrollStatus
  employeeCount?: number
  totalAmount?: number
  approverRole?: 'admin' | 'finance'
  hasAllCalculations?: boolean
}

export const payrollTransitions: PayrollTransition[] = [
  {
    from: ['draft'],
    to: 'calculating',
    trigger: 'START_CALCULATION',
    guard: (ctx) => (ctx.employeeCount || 0) > 0,
  },
  {
    from: ['calculating'],
    to: 'pending_approval',
    trigger: 'CALCULATION_COMPLETE',
    guard: (ctx) => ctx.hasAllCalculations === true,
  },
  {
    from: ['calculating'],
    to: 'failed',
    trigger: 'CALCULATION_FAILED',
  },
  {
    from: ['pending_approval'],
    to: 'approved',
    trigger: 'APPROVE',
    guard: (ctx) => ctx.approverRole === 'admin' || ctx.approverRole === 'finance',
  },
  {
    from: ['pending_approval'],
    to: 'draft',
    trigger: 'REJECT',
    guard: (ctx) => ctx.approverRole === 'admin' || ctx.approverRole === 'finance',
  },
  {
    from: ['approved'],
    to: 'processing',
    trigger: 'START_PROCESSING',
  },
  {
    from: ['processing'],
    to: 'completed',
    trigger: 'PROCESSING_COMPLETE',
  },
  {
    from: ['processing'],
    to: 'failed',
    trigger: 'PROCESSING_FAILED',
  },
  {
    from: ['failed'],
    to: 'draft',
    trigger: 'RETRY',
  },
]

export function canTransitionPayroll(
  currentStatus: PayrollStatus,
  targetStatus: PayrollStatus,
  context: Partial<PayrollContext>
): { allowed: boolean; reason?: string } {
  const transition = payrollTransitions.find(
    (t) => t.from.includes(currentStatus) && t.to === targetStatus
  )

  if (!transition) {
    return { allowed: false, reason: `Invalid transition from ${currentStatus} to ${targetStatus}` }
  }

  const fullContext: PayrollContext = {
    payrollId: context.payrollId || '',
    currentStatus,
    ...context,
  }

  if (transition.guard && !transition.guard(fullContext)) {
    return { allowed: false, reason: 'Transition guard failed' }
  }

  return { allowed: true }
}

// =============================================================================
// PTO REQUEST STATE MACHINE
// =============================================================================
export type PTOStatus = 'pending' | 'approved' | 'denied' | 'cancelled' | 'taken' | 'completed'

export interface PTOTransition {
  from: PTOStatus[]
  to: PTOStatus
  trigger: string
  guard?: (context: PTOContext) => boolean
}

export interface PTOContext {
  requestId: string
  currentStatus: PTOStatus
  requesterId?: string
  approverId?: string
  actorId?: string
  actorRole?: 'admin' | 'manager' | 'employee'
  hoursRequested?: number
  hoursAvailable?: number
  startDate?: Date
}

export const ptoTransitions: PTOTransition[] = [
  {
    from: ['pending'],
    to: 'approved',
    trigger: 'APPROVE',
    guard: (ctx) => {
      // Manager or admin can approve, requester cannot approve own request
      if (ctx.actorRole !== 'admin' && ctx.actorRole !== 'manager') return false
      if (ctx.actorId === ctx.requesterId) return false
      // Must have enough hours
      if ((ctx.hoursAvailable || 0) < (ctx.hoursRequested || 0)) return false
      return true
    },
  },
  {
    from: ['pending'],
    to: 'denied',
    trigger: 'DENY',
    guard: (ctx) => {
      if (ctx.actorRole !== 'admin' && ctx.actorRole !== 'manager') return false
      return true
    },
  },
  {
    from: ['pending', 'approved'],
    to: 'cancelled',
    trigger: 'CANCEL',
    guard: (ctx) => {
      // Employee can cancel own request, or admin can cancel any
      if (ctx.actorId === ctx.requesterId) return true
      if (ctx.actorRole === 'admin') return true
      return false
    },
  },
  {
    from: ['approved'],
    to: 'taken',
    trigger: 'START_LEAVE',
    guard: (ctx) => {
      // Automatic transition when start date is reached
      if (!ctx.startDate) return false
      return new Date() >= ctx.startDate
    },
  },
  {
    from: ['taken'],
    to: 'completed',
    trigger: 'END_LEAVE',
  },
]

export function canTransitionPTO(
  currentStatus: PTOStatus,
  targetStatus: PTOStatus,
  context: Partial<PTOContext>
): { allowed: boolean; reason?: string } {
  const transition = ptoTransitions.find(
    (t) => t.from.includes(currentStatus) && t.to === targetStatus
  )

  if (!transition) {
    return { allowed: false, reason: `Invalid transition from ${currentStatus} to ${targetStatus}` }
  }

  const fullContext: PTOContext = {
    requestId: context.requestId || '',
    currentStatus,
    ...context,
  }

  if (transition.guard && !transition.guard(fullContext)) {
    return { allowed: false, reason: 'Transition guard failed' }
  }

  return { allowed: true }
}

// =============================================================================
// STATE MACHINE VALIDATION HELPERS
// =============================================================================
export function getValidTransitions<T extends string>(
  currentStatus: T,
  transitions: { from: T[]; to: T; trigger: string }[]
): { to: T; trigger: string }[] {
  return transitions
    .filter((t) => t.from.includes(currentStatus))
    .map((t) => ({ to: t.to, trigger: t.trigger }))
}

export function getEmployeeNextStates(status: EmployeeStatus): { to: EmployeeStatus; trigger: string }[] {
  return getValidTransitions(status, employeeTransitions)
}

export function getPayrollNextStates(status: PayrollStatus): { to: PayrollStatus; trigger: string }[] {
  return getValidTransitions(status, payrollTransitions)
}

export function getPTONextStates(status: PTOStatus): { to: PTOStatus; trigger: string }[] {
  return getValidTransitions(status, ptoTransitions)
}
