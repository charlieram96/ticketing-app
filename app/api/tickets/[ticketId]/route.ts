import { NextRequest, NextResponse } from 'next/server'
import { GoogleSheetsService } from '@/lib/google-sheets'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params
    const sheets = new GoogleSheetsService()
    const ticket = await sheets.getTicket(ticketId)
    
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
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params
    const { action, selectedDay } = await request.json()
    
    if (!['redeem', 'reset', 'view'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }
    
    const sheets = new GoogleSheetsService()
    
    // For redeem action, validate the day
    if (action === 'redeem') {
      if (!selectedDay || !['day1', 'day2', 'day3', 'day4', 'day5'].includes(selectedDay)) {
        return NextResponse.json(
          { error: 'Selected day is required for check-in' },
          { status: 400 }
        )
      }
      
      // Get the ticket to check its valid day
      const ticket = await sheets.getTicket(ticketId)
      if (!ticket) {
        return NextResponse.json(
          { error: 'Ticket not found' },
          { status: 404 }
        )
      }
      
      // Check if the selected day matches the ticket's valid day
      if (ticket.validDay !== selectedDay) {
        return NextResponse.json(
          { 
            error: `This ticket is only valid for ${ticket.validDay.replace('day', 'Day ')}, but you selected ${selectedDay.replace('day', 'Day ')}`,
            ticketValidDay: ticket.validDay,
            selectedDay: selectedDay
          },
          { status: 400 }
        )
      }
      
      // Check if ticket is already redeemed
      if (ticket.status === 'redeemed') {
        // Format the redemption time in EST
        const redeemedAt = ticket.redeemedAt ? new Date(ticket.redeemedAt) : null
        let errorMessage = 'Ticket has already been redeemed'
        
        if (redeemedAt) {
          const options: Intl.DateTimeFormatOptions = {
            timeZone: 'America/New_York',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }
          const formattedTime = redeemedAt.toLocaleString('en-US', options)
          errorMessage += `. Previously redeemed on ${formattedTime} EST.`
        }
        
        return NextResponse.json(
          { error: errorMessage },
          { status: 400 }
        )
      }
    }
    
    const updatedTicket = await sheets.updateTicket(ticketId, action)
    
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