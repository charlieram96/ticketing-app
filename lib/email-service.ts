import sgMail from '@sendgrid/mail'
import JsBarcode from 'jsbarcode'

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export interface EmailResult {
  success: boolean
  email: string
  error?: string
}

export interface BadgeEmailData {
  badgeId: string
  name: string
  email: string
  type: 'Badge' | 'Multiday Badge'
  days: number[]
}

export class EmailService {
  private fromEmail: string
  private fromName: string

  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@example.com'
    this.fromName = process.env.FROM_NAME || 'Badge System'
  }

  /**
   * Generate a barcode image as base64 string
   */
  private generateBarcodeImage(badgeId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        
        // Set canvas size
        canvas.width = 1250
        canvas.height = 136
        
        // Fill white background
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Generate barcode on temporary canvas
        const tempCanvas = document.createElement('canvas')
        JsBarcode(tempCanvas, badgeId, {
          format: 'CODE128',
          width: 10,
          height: 360,
          displayValue: false,
          background: '#ffffff',
          lineColor: '#000000',
          margin: 10,
          flat: false
        })
        
        // Draw barcode onto main canvas
        ctx.drawImage(tempCanvas, 0, 0)
        
        // Add text overlay
        ctx.fillStyle = 'white'
        ctx.font = 'bold 36px Arial'
        const text = badgeId
        const textMetrics = ctx.measureText(text)
        const textWidth = textMetrics.width
        
        // Position in bottom right
        const x = canvas.width - textWidth - 5
        const y = canvas.height
        
        // Draw white background for text
        ctx.fillRect(x - 10, y - 36, textWidth + 20, 36)
        
        // Draw black text
        ctx.fillStyle = 'black'
        ctx.fillText(text, x, y)
        
        // Convert to base64
        const base64 = canvas.toDataURL('image/png').split(',')[1]
        resolve(base64)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Generate a barcode image using Node.js Canvas (server-side)
   */
  private async generateBarcodeImageServer(badgeId: string): Promise<string> {
    // For server-side rendering, we'll use a different approach
    // Since we can't use DOM canvas on the server, we'll create a simple SVG
    const svg = `
      <svg width="400" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="100" fill="white"/>
        <text x="200" y="50" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold">${badgeId}</text>
        <!-- Barcode bars would be generated here -->
        <rect x="50" y="20" width="2" height="60" fill="black"/>
        <rect x="54" y="20" width="1" height="60" fill="black"/>
        <rect x="57" y="20" width="3" height="60" fill="black"/>
        <rect x="62" y="20" width="1" height="60" fill="black"/>
        <rect x="65" y="20" width="2" height="60" fill="black"/>
        <!-- More barcode bars... -->
      </svg>
    `
    
    // Convert SVG to base64
    return Buffer.from(svg).toString('base64')
  }

  /**
   * Create email template for badge
   */
  private createEmailTemplate(badge: BadgeEmailData): string {
    const validDaysText = badge.type === 'Multiday Badge' 
      ? `Valid for days: ${badge.days.join(', ')}`
      : 'Valid for all event days'

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your Event Badge</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background-color: #6366f1; color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .badge-info { background-color: #f8fafc; border-radius: 6px; padding: 20px; margin: 20px 0; }
          .badge-id { font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; color: #374151; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
          .barcode-note { color: #6b7280; font-size: 14px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Event Badge</h1>
          </div>
          <div class="content">
            <h2>Hello ${badge.name},</h2>
            <p>Your event badge is ready! Please find your barcode attached to this email.</p>
            
            <div class="badge-info">
              <h3>Badge Details:</h3>
              <p><strong>Badge ID:</strong> <span class="badge-id">${badge.badgeId}</span></p>
              <p><strong>Name:</strong> ${badge.name}</p>
              <p><strong>Type:</strong> ${badge.type}</p>
              <p><strong>Access:</strong> ${validDaysText}</p>
            </div>

            <p>Please save the barcode image attached to this email. You'll need to present it at the event for check-in.</p>
            
            <div class="barcode-note">
              <p><strong>Important:</strong></p>
              <ul>
                <li>Save the barcode image to your phone or print it out</li>
                <li>Present the barcode at check-in stations</li>
                <li>${badge.type === 'Multiday Badge' ? 'This badge can only be used once per valid day' : 'This badge can be used for all event days'}</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>If you have any questions, please contact event support.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Send badge email to a single recipient
   */
  async sendBadgeEmail(badge: BadgeEmailData): Promise<EmailResult> {
    if (!badge.email || !badge.email.includes('@')) {
      return {
        success: false,
        email: badge.email,
        error: 'Invalid email address'
      }
    }

    if (!process.env.SENDGRID_API_KEY) {
      return {
        success: false,
        email: badge.email,
        error: 'SendGrid API key not configured'
      }
    }

    try {
      // Generate barcode image
      const barcodeBase64 = await this.generateBarcodeImageServer(badge.badgeId)
      
      const msg = {
        to: badge.email,
        cc: 'flscticket@gmail.com',
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        subject: `Your Event Badge - ${badge.badgeId}`,
        html: this.createEmailTemplate(badge),
        attachments: [
          {
            content: barcodeBase64,
            filename: `badge-${badge.badgeId}.png`,
            type: 'image/png',
            disposition: 'attachment'
          }
        ]
      }

      await sgMail.send(msg)
      
      return {
        success: true,
        email: badge.email
      }
    } catch (error: any) {
      console.error('Error sending badge email:', error)
      return {
        success: false,
        email: badge.email,
        error: error.message || 'Failed to send email'
      }
    }
  }

  /**
   * Send badge emails to multiple recipients
   */
  async sendBadgeEmails(badges: BadgeEmailData[]): Promise<EmailResult[]> {
    const results: EmailResult[] = []
    
    // Send emails sequentially to avoid rate limiting
    for (const badge of badges) {
      const result = await this.sendBadgeEmail(badge)
      results.push(result)
      
      // Add small delay between emails
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    return results
  }
}

export const emailService = new EmailService()