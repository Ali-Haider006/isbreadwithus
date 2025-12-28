import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { cookies } from "next/headers"
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/sign-in')
  }

  // Fetch registrations
  const { data: registrations, error: regError } = await supabase
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch feedback
  const { data: feedback, error: feedbackError } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <DashboardClient 
      user={user} 
      registrations={registrations || []} 
      feedback={feedback || []} 
    />
  )
}