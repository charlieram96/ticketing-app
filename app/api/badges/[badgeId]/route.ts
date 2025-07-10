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
    const { action } = await request.json()
    
    if (action !== 'check-in' && action !== 'view') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }
    
    const sheets = new GoogleSheetsService()
    
    if (action === 'check-in') {
      const updatedBadge = await sheets.updateBadgeCheckIn(badgeId)
      
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