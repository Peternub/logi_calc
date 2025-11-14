import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    return NextResponse.json({
      status: 'ok',
      environment: process.env.NODE_ENV,
      supabase: {
        url_configured: !!supabaseUrl,
        key_configured: !!supabaseAnonKey,
        url_preview: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'Not set'
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Environment check failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}