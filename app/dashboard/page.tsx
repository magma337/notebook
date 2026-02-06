import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './client-view'

export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    const { data: summaries } = await supabase
        .from('summaries')
        .select('*')
        .order('created_at', { ascending: false })

    return <DashboardClient initialSummaries={summaries || []} />
}
