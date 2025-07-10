import { NextRequest, NextResponse } from 'next/server'
import { GoogleSheetsService } from '@/lib/google-sheets'

export async function GET() {
  try {
    const sheets = new GoogleSheetsService()
    const badges = await sheets.getAllBadges()
    return NextResponse.json(badges)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    )
  }
}