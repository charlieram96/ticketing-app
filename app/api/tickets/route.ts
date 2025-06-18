import { NextRequest, NextResponse } from 'next/server'
import { GoogleSheetsService } from '@/lib/google-sheets'
import { nanoid } from 'nanoid'

export async function GET() {
  try {
    const sheets = new GoogleSheetsService()
    const tickets = await sheets.getAllTickets()
    return NextResponse.json(tickets)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { quantity } = await request.json()
    
    if (!quantity || quantity < 1 || quantity > 1000) {
      return NextResponse.json(
        { error: 'Invalid quantity' },
        { status: 400 }
      )
    }

    const sheets = new GoogleSheetsService()
    await sheets.initializeSheet()
    
    const ticketIds = Array.from({ length: quantity }, () => `TKT-${nanoid(8).toUpperCase()}`)
    await sheets.createTickets(ticketIds)
    
    return NextResponse.json({ tickets: ticketIds })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create tickets' },
      { status: 500 }
    )
  }
}