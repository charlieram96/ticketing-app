import { NextRequest, NextResponse } from 'next/server'
import { GoogleSheetsService } from '@/lib/google-sheets'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ badgeId: string }> }
) {
  try {
    const { badgeId } = await params
    const sheets = new GoogleSheetsService()
    const badge = await sheets.getBadge(badgeId)
    
    if (!badge) {
      return NextResponse.json(
        { error: 'Badge not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(badge)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch badge' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ badgeId: string }> }
) {
  try {
    const { badgeId } = await params
    const { action, selectedDay, scanMode } = await request.json()
    
    if (!['check-in', 'view', 'reset'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }
    
    const sheets = new GoogleSheetsService()
    
    if (action === 'check-in') {
      // Get badge first to check if it's multiday
      const badge = await sheets.getBadge(badgeId)
      if (!badge) {
        return NextResponse.json(
          { error: 'Badge not found' },
          { status: 404 }
        )
      }
      
      // Check if multiday badge is being scanned in badge mode
      if (badge.type === 'Multiday Badge' && scanMode === 'badge') {
        return NextResponse.json(
          { error: 'This is a multi day ticket and should be scanned using checkin mode for current day' },
          { status: 400 }
        )
      }
      
      // For multiday badges, validate selectedDay
      if (badge.type === 'Multiday Badge') {
        if (!selectedDay || !badge.days.includes(selectedDay)) {
          const validDaysString = badge.days.join(', ')
          return NextResponse.json(
            { 
              error: `This badge is only valid for days ${validDaysString}, but you selected day ${selectedDay}`,
              badgeValidDays: badge.days,
              selectedDay: selectedDay
            },
            { status: 400 }
          )
        }
      }
      
      try {
        const updatedBadge = await sheets.updateBadgeCheckIn(badgeId, selectedDay)
        return NextResponse.json(updatedBadge)
      } catch (error: any) {
        if (error.message.includes('already been scanned')) {
          return NextResponse.json(
            { error: error.message },
            { status: 400 }
          )
        }
        throw error
      }
    } else if (action === 'reset') {
      const updatedBadge = await sheets.resetBadge(badgeId)
      
      if (!updatedBadge) {
        return NextResponse.json(
          { error: 'Badge not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(updatedBadge)
    } else {
      // For view action, just return the badge without updating
      const badge = await sheets.getBadge(badgeId)
      
      if (!badge) {
        return NextResponse.json(
          { error: 'Badge not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(badge)
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update badge' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ badgeId: string }> }
) {
  try {
    const { badgeId } = await params
    const { name, department, type, days } = await request.json()
    
    if (!name || !department || !type) {
      return NextResponse.json(
        { error: 'Name, department, and type are required' },
        { status: 400 }
      )
    }

    if (!['Badge', 'Multiday Badge'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be "Badge" or "Multiday Badge"' },
        { status: 400 }
      )
    }

    // Validate days array
    if (!Array.isArray(days) || days.length === 0) {
      return NextResponse.json(
        { error: 'Days must be a non-empty array' },
        { status: 400 }
      )
    }

    // Validate all days are between 1-4
    const validDayOptions = [1, 2, 3, 4]
    if (!days.every(day => validDayOptions.includes(day))) {
      return NextResponse.json(
        { error: 'Days must be between 1 and 4' },
        { status: 400 }
      )
    }

    const sheets = new GoogleSheetsService()
    
    // Check if badge exists
    const existingBadge = await sheets.getBadge(badgeId)
    if (!existingBadge) {
      return NextResponse.json(
        { error: 'Badge not found' },
        { status: 404 }
      )
    }
    
    const updatedBadge = await sheets.updateBadgeDetails(badgeId, {
      name,
      department,
      type,
      days
    })
    
    if (!updatedBadge) {
      return NextResponse.json(
        { error: 'Failed to update badge' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(updatedBadge)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update badge' },
      { status: 500 }
    )
  }
}