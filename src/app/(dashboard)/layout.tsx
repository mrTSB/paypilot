'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from '@/components/ui/command'
import {
  Sparkles,
  LayoutDashboard,
  Users,
  Calculator,
  Clock,
  Shield,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  Bell,
  ChevronDown,
  Network,
  BarChart3
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const notifications = [
  { id: 1, title: 'PTO Request', message: 'Sarah Chen requested 3 days PTO', time: '2 hours ago', unread: true },
  { id: 2, title: 'Payroll Ready', message: 'Feb 2-15 payroll is ready for approval', time: '3 hours ago', unread: true },
  { id: 3, title: 'New Hire', message: 'Mike Johnson completed onboarding', time: '5 hours ago', unread: true },
  { id: 4, title: 'Benefits Update', message: '3 employees enrolled in 401(k)', time: '1 day ago', unread: false },
  { id: 5, title: 'Time Entry', message: '2 time entries need approval', time: '1 day ago', unread: false },
]

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Employees', href: '/employees', icon: Users },
  { name: 'Org Chart', href: '/org-chart', icon: Network },
  { name: 'Payroll', href: '/payroll', icon: Calculator },
  { name: 'Time & PTO', href: '/time', icon: Clock },
  { name: 'Benefits', href: '/benefits', icon: Shield },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'AI Assistant', href: '/ai', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)

  // Cmd+K keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r hidden lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 px-6 border-b">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
              PayPilot
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  {item.name}
                  {item.name === 'AI Assistant' && (
                    <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full">
                      New
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Company info */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">AC</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">Acme Technologies</p>
                <p className="text-xs text-slate-500">Growth Plan</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-full flex-col">
                <div className="flex h-16 items-center gap-2 px-6 border-b">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                    PayPilot
                  </span>
                </div>
                <nav className="flex-1 px-4 py-4 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
            PayPilot
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5 text-slate-600" />
          </Button>
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">JD</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Desktop header */}
        <header className="hidden lg:flex h-16 items-center justify-between px-8 bg-white border-b">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              {navigation.find((n) => pathname === n.href || pathname.startsWith(n.href + '/'))?.name || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Command Palette Trigger */}
            <Button
              variant="outline"
              className="hidden md:flex items-center gap-2 text-slate-500 px-3"
              onClick={() => setCommandOpen(true)}
            >
              <span className="text-sm">Search...</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-600">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5 text-slate-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Notifications</h3>
                    <span className="text-xs text-blue-600 cursor-pointer hover:underline">Mark all read</span>
                  </div>
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="divide-y">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 hover:bg-slate-50 cursor-pointer ${notif.unread ? 'bg-blue-50/50' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          {notif.unread && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          )}
                          <div className={notif.unread ? '' : 'ml-5'}>
                            <p className="font-medium text-sm text-slate-900">{notif.title}</p>
                            <p className="text-sm text-slate-600">{notif.message}</p>
                            <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-3 border-t">
                  <Button variant="ghost" className="w-full text-sm">
                    View all notifications
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">JD</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">John Doe</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8 mt-16 lg:mt-0">
          {children}
        </main>
      </div>

      {/* Command Palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {navigation.map((item) => (
              <CommandItem
                key={item.name}
                onSelect={() => {
                  router.push(item.href)
                  setCommandOpen(false)
                }}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.name}</span>
                {item.name === 'Dashboard' && <CommandShortcut>⌘D</CommandShortcut>}
                {item.name === 'Employees' && <CommandShortcut>⌘E</CommandShortcut>}
                {item.name === 'Payroll' && <CommandShortcut>⌘P</CommandShortcut>}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => {
                router.push('/employees?add=true')
                setCommandOpen(false)
              }}
            >
              <Users className="mr-2 h-4 w-4" />
              <span>Add New Employee</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                router.push('/payroll/run')
                setCommandOpen(false)
              }}
            >
              <Calculator className="mr-2 h-4 w-4" />
              <span>Run Payroll</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                router.push('/ai')
                setCommandOpen(false)
              }}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              <span>Ask AI Assistant</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Account">
            <CommandItem
              onSelect={() => {
                router.push('/settings')
                setCommandOpen(false)
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                handleSignOut()
                setCommandOpen(false)
              }}
              className="text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}
