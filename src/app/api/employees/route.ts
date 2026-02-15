import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's company membership
    const { data: membership, error: membershipError } = await supabase
      .from('company_members')
      .select('company_id, role')
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json({ employees: [], company: null })
    }

    // Get all employees for the company
    const { data: employees, error: employeesError } = await supabase
      .from('company_members')
      .select(`
        id,
        role,
        department,
        job_title,
        hire_date,
        employment_type,
        status,
        salary_amount_cents,
        salary_currency,
        salary_frequency,
        reports_to,
        created_at,
        profiles!company_members_user_id_fkey (
          id,
          email,
          full_name,
          avatar_url,
          phone
        )
      `)
      .eq('company_id', membership.company_id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (employeesError) {
      console.error('Error fetching employees:', employeesError)
      return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
    }

    // Format employees
    const formattedEmployees = (employees || []).map((emp) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profileData = emp.profiles as any
      const profile = Array.isArray(profileData) ? profileData[0] : profileData
      const name = profile?.full_name || 'Unknown'
      const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()

      return {
        id: emp.id,
        name,
        email: profile?.email || '',
        phone: profile?.phone || '',
        avatarUrl: profile?.avatar_url,
        initials,
        role: emp.role,
        department: emp.department || 'Unassigned',
        jobTitle: emp.job_title || 'Employee',
        hireDate: emp.hire_date,
        employmentType: emp.employment_type,
        status: emp.status,
        salary: emp.salary_amount_cents ? {
          amount: emp.salary_amount_cents / 100,
          currency: emp.salary_currency,
          frequency: emp.salary_frequency,
        } : null,
        reportsTo: emp.reports_to,
      }
    })

    // Get department stats
    const departmentCounts: Record<string, number> = {}
    formattedEmployees.forEach(emp => {
      const dept = emp.department
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1
    })

    return NextResponse.json({
      employees: formattedEmployees,
      stats: {
        total: formattedEmployees.length,
        byDepartment: departmentCounts,
        byEmploymentType: {
          fullTime: formattedEmployees.filter(e => e.employmentType === 'full_time').length,
          partTime: formattedEmployees.filter(e => e.employmentType === 'part_time').length,
          contractor: formattedEmployees.filter(e => e.employmentType === 'contractor').length,
        },
      },
    })
  } catch (error) {
    console.error('Employees API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
