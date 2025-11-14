import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('[TEST API] Health check endpoint called')
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'API is working correctly'
    })
  } catch (error) {
    console.error('[TEST API] Error:', error)
    return NextResponse.json(
      { error: 'Test endpoint failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}