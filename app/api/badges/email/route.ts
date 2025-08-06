import { NextRequest, NextResponse } from 'next/server'
import { GoogleSheetsService } from '@/lib/google-sheets'
import { emailService, EmailResult } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { badgeIds } = await request.json()
    
    if (!Array.isArray(badgeIds) || badgeIds.length === 0) {
      return NextResponse.json(
        { error: 'Badge IDs array is required' },
        { status: 400 }
      )
    }

    if (badgeIds.length > 50) {
      return NextResponse.json(
        { error: 'Cannot send more than 50 emails at once' },
        { status: 400 }
      )
    }

    const sheets = new GoogleSheetsService()
    
    // Get badge data for all requested IDs
    const badges = []
    const notFound = []
    
    for (const badgeId of badgeIds) {
      const badge = await sheets.getBadge(badgeId)
      if (badge) {
        badges.push({
          badgeId: badge.badgeId,
          name: badge.name,
          email: badge.email,
          department: badge.department,
          type: badge.type,
          days: badge.days,
          companion: badge.companion
        })
      } else {
        notFound.push(badgeId)
      }
    }

    if (badges.length === 0) {
      return NextResponse.json(
        { error: 'No valid badges found' },
        { status: 404 }
      )
    }

    // Filter out badges without email addresses
    const badgesWithEmail = badges.filter(badge => badge.email && badge.email.includes('@'))
    const badgesWithoutEmail = badges.filter(badge => !badge.email || !badge.email.includes('@'))

    if (badgesWithEmail.length === 0) {
      return NextResponse.json(
        { 
          error: 'No badges have valid email addresses',
          badgesWithoutEmail: badgesWithoutEmail.map(b => ({ badgeId: b.badgeId, name: b.name }))
        },
        { status: 400 }
      )
    }

    // Send emails
    const results = await emailService.sendBadgeEmails(badgesWithEmail)
    
    // Compile response
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)
    
    return NextResponse.json({
      success: true,
      summary: {
        total: badgeIds.length,
        sent: successful.length,
        failed: failed.length,
        notFound: notFound.length,
        noEmail: badgesWithoutEmail.length
      },
      results: {
        sent: successful,
        failed: failed,
        notFound: notFound,
        noEmail: badgesWithoutEmail.map(b => ({ badgeId: b.badgeId, name: b.name, email: b.email }))
      }
    })
    
  } catch (error: any) {
    console.error('Error sending badge emails:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send emails' },
      { status: 500 }
    )
  }
}