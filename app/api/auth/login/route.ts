import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PASSWORD = process.env.SYSTEM_PASSWORD || 'ticket123'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (password === SYSTEM_PASSWORD) {
      return NextResponse.json({ success: true })
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