import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  
  const { id, status } = await request.json()
  
  const { error } = await supabase
    .from('registrations')
    .update({ status })
    .eq('id', id)
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ success: true })
}