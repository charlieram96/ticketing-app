import { NextRequest, NextResponse } from 'next/server'
import { GoogleSheetsService } from '@/lib/google-sheets'

export async function GET(
  request: NextRequest,
  { params }: { params: { ticketId: string } }
) {
  try {
    const sheets = new GoogleSheetsService()
    const ticket = await sheets.getTicket(params.ticketId)
    
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(ticket)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { ticketId: string } }
) {
  try {
    const { action } = await request.json()
    
    if (!['redeem', 'reset', 'view'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }
    
    const sheets = new GoogleSheetsService()
    const updatedTicket = await sheets.updateTicket(params.ticketId, action)
    
    if (!updatedTicket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(updatedTicket)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    )
  }
}