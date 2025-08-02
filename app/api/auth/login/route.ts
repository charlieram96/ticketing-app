import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin2025'
const LIMITED_PASSWORD = process.env.LIMITED_PASSWORD || 'ticket2025'
const SYSTEM_PASSWORD = process.env.SYSTEM_PASSWORD || 'ticket123'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (password === ADMIN_PASSWORD || password === SYSTEM_PASSWORD) {
      return NextResponse.json({ success: true, role: 'admin' })
    } else if (password === LIMITED_PASSWORD) {
      return NextResponse.json({ success: true, role: 'limited' })
    } else {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}