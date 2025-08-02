import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    {
      id: 1,
      name: 'GitHub Integration',
      type: 'github',
      enabled: false,
      config: {}
    }
  ])
}