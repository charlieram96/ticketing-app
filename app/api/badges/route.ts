import { NextRequest, NextResponse } from 'next/server'
import { GoogleSheetsService } from '@/lib/google-sheets'

export async function GET(request: NextRequest) {
  try {
    const sheets = new GoogleSheetsService()
    await sheets.initializeBadgeSheet()
    const badges = await sheets.getAllBadges()
    
    // Handle filtering by type
    const url = new URL(request.url)
    const filterType = url.searchParams.get('type')
    
    let filteredBadges = badges
    if (filterType === 'multiday') {
      filteredBadges = badges.filter(badge => badge.type === 'Multiday Badge')
    } else if (filterType === 'regular') {
      filteredBadges = badges.filter(badge => badge.type === 'Badge')
    }
    
    return NextResponse.json(filteredBadges)
  } catch (error) {
    console.error('Error fetching badges:', error)
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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
    const validDays = days || [1, 2, 3, 4]
    if (!Array.isArray(validDays) || validDays.length === 0) {
      return NextResponse.json(
        { error: 'Days must be a non-empty array' },
        { status: 400 }
      )
    }

    // Validate all days are between 1-4
    const validDayOptions = [1, 2, 3, 4]
    if (!validDays.every(day => validDayOptions.includes(day))) {
      return NextResponse.json(
        { error: 'Days must be between 1 and 4' },
        { status: 400 }
      )
    }

    const sheets = new GoogleSheetsService()
    await sheets.initializeBadgeSheet()
    
    // Generate unique badge ID
    let badgeId: string
    let attempts = 0
    const maxAttempts = 10
    
    do {
      badgeId = `BDG-${Math.floor(100000 + Math.random() * 900000)}`
      const existingBadge = await sheets.getBadge(badgeId)
      if (!existingBadge) {
        break // ID is unique
      }
      attempts++
    } while (attempts < maxAttempts)
    
    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'Unable to generate unique badge ID after multiple attempts' },
        { status: 500 }
      )
    }
    
    const badge = await sheets.createBadge({
      badgeId,
      name,
      department,
      type,
      days: validDays
    })
    
    return NextResponse.json(badge)
  } catch (error: any) {
    console.error('Error creating badge:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create badge' },
      { status: 500 }
    )
  }
}