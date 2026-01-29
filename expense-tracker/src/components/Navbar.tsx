'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface NavbarProps {
  user: User
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li><Link href="/dashboard">Dashboard</Link></li>
            <li><Link href="/transactions">Transactions</Link></li>
          </ul>
        </div>
        <Link href="/dashboard" className="btn btn-ghost text-xl">
          Expense Tracker
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li><Link href="/dashboard">Dashboard</Link></li>
          <li><Link href="/transactions">Transactions</Link></li>
        </ul>
      </div>
      <div className="navbar-end">
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
            <div className="bg-primary text-primary-content rounded-full w-10">
              <span className="text-sm">{user.email?.charAt(0).toUpperCase()}</span>
            </div>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li className="menu-title">
              <span className="truncate">{user.email}</span>
            </li>
            <li><button onClick={handleSignOut}>Sign Out</button></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
