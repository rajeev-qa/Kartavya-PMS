import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    {
      id: 1,
      username: 'admin',
      email: 'admin@kartavya.com',
      role: 'admin',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      username: 'john',
      email: 'john@example.com',
      role: 'developer',
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      username: 'jane',
      email: 'jane@example.com',
      role: 'developer',
      created_at: new Date().toISOString()
    }
  ])
}