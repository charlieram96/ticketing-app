import { NextRequest, NextResponse } from 'next/server'
import { GoogleSheetsService } from '@/lib/google-sheets'

export async function GET() {
  try {
    const sheets = new GoogleSheetsService()
    const tickets = await sheets.getAllTickets()
    return NextResponse.json(tickets || [])
  } catch (error) {
    console.error('Error in GET /api/tickets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tickets', tickets: [] },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { quantity, validDay } = await request.json()
    
    if (!quantity || quantity < 1 || quantity > 1000) {
      return NextResponse.json(
        { error: 'Invalid quantity' },
        { status: 400 }
      )
    }

    if (!validDay || !['day1', 'day2', 'day3', 'day4', 'day5'].includes(validDay)) {
      return NextResponse.json(
        { error: 'Invalid valid day' },
        { status: 400 }
      )
    }

    const sheets = new GoogleSheetsService()
    await sheets.initializeSheet()
    await sheets.initializeBadgeSheet()
    
    // Generate unique ticket IDs with 6-digit numbers
    const ticketIds: string[] = []
    const existingTickets = await sheets.getAllTickets()
    const existingIds = new Set(existingTickets.map(t => t.id))
    
    for (let i = 0; i < quantity; i++) {
      let ticketId: string
      let attempts = 0
      const maxAttempts = 10
      
      do {
        ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`
        attempts++
      } while (existingIds.has(ticketId) && attempts < maxAttempts)
      
      if (attempts >= maxAttempts) {
        throw new Error('Unable to generate unique ticket ID')
      }
      
      ticketIds.push(ticketId)
      existingIds.add(ticketId) // Prevent duplicates within this batch
    }
    await sheets.createTickets(ticketIds, validDay)
    
    return NextResponse.json({ tickets: ticketIds })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create tickets' },
      { status: 500 }
    )
  }
}