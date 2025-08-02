import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      results: [],
      total: 0,
      message: 'No results found'
    }
  })
}