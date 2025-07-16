import sgMail from '@sendgrid/mail'
import JsBarcode from 'jsbarcode'            // ← still here if you later need client‑side generation

// ───────────────────────────────────────────────────────────
//  INITIALISE SENDGRID
// ───────────────────────────────────────────────────────────
if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY env‑var is missing')
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// ───────────────────────────────────────────────────────────
//  TYPES
// ───────────────────────────────────────────────────────────
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

// ───────────────────────────────────────────────────────────
//  SERVICE
// ───────────────────────────────────────────────────────────
export class EmailService {
  private fromEmail: string
  private fromName: string

  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'tickets@example.com'
    this.fromName  = process.env.FROM_NAME  || 'Event Tickets'
  }

  /*─────────────────────────────────────────────────────────
    GENERATE BARCODE  (server‑side SVG → base‑64)
  ─────────────────────────────────────────────────────────*/
  private async generateBarcodeImageServer(badgeId: string): Promise<string> {
    const svg = `
      <svg width="400" height="120" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="120" fill="white" stroke="black" stroke-width="2"/>
        <text x="200" y="70" text-anchor="middle"
              font-family="monospace" font-size="24"
              font-weight="bold" fill="black">${badgeId}</text>
      </svg>`
    return Buffer.from(svg).toString('base64')            // raw base‑64 (no data prefix)
  }

  /*─────────────────────────────────────────────────────────
    PLAIN‑TEXT MIME PART  (improves deliverability)
  ─────────────────────────────────────────────────────────*/
  private createPlainText(badge: BadgeEmailData): string {
    return [
      `Hello ${badge.name},`,
      '',
      `Your event badge (${badge.badgeId}) is ready.`,
      `Type: ${badge.type}`,
      badge.type === 'Multiday Badge'
        ? `Valid for days: ${badge.days.join(', ')}`
        : 'Valid for all event days',
      '',
      'Present the barcode below (or this email) at check‑in.',
      '',
      '— Event Support'
    ].join('\n')
  }

  /*─────────────────────────────────────────────────────────
    HTML MIME PART
  ─────────────────────────────────────────────────────────*/
  private createEmailTemplate(
    badge: BadgeEmailData,
    imgSrc: string                                      // ← data‑URI injected here
  ): string {
    const validDaysText = badge.type === 'Multiday Badge'
      ? `Valid for days: ${badge.days.join(', ')}`
      : 'Valid for all event days'

    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" />
<title>Your Event Badge</title>
<style>
  body{margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5}
  .container{max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;
             box-shadow:0 2px 10px rgba(0,0,0,.1)}
  .header{background:#6366f1;color:#fff;padding:30px;text-align:center}
  .content{padding:30px}
  .badge-info{background:#f8fafc;border-radius:6px;padding:20px;margin:20px 0}
  .badge-id{font-family:Courier New,monospace;font-size:24px;font-weight:bold;color:#374151}
  .barcode-section{text-align:center;background:#f8fafc;border-radius:6px;padding:20px;margin:20px 0}
  .barcode-image{max-width:100%;height:auto;border:1px solid #e5e7eb;border-radius:4px;background:#fff}
  .footer{background:#f8fafc;padding:20px;text-align:center;color:#6b7280;font-size:14px}
  ul{padding-left:18px}
</style>
</head>
<body>
  <span style="display:none;">Your ticket barcode is inside – show it at check‑in</span>
  <div class="container">
    <div class="header"><h1>Your Event Badge</h1></div>
    <div class="content">
      <h2>Hello ${badge.name},</h2>
      <p>Your event badge is ready! Please find your barcode below.</p>

      <div class="badge-info">
        <h3>Badge Details:</h3>
        <p><strong>Badge&nbsp;ID:</strong> <span class="badge-id">${badge.badgeId}</span></p>
        <p><strong>Name:</strong> ${badge.name}</p>
        <p><strong>Type:</strong> ${badge.type}</p>
        <p><strong>Access:</strong> ${validDaysText}</p>
      </div>

      <div class="barcode-section">
        <h3>Your Barcode:</h3>
        <img src="${imgSrc}" alt="Badge Barcode ${badge.badgeId}" class="barcode-image" />
        <p style="margin-top:10px;font-size:14px;color:#6b7280;">Badge ID: ${badge.badgeId}</p>
      </div>

      <p>Please save or screenshot this barcode. You'll need it at the event for check‑in.</p>

      <p><strong>Important:</strong></p>
      <ul>
        <li>Keep this email handy or add it to your wallet app</li>
        <li>Present the barcode at check‑in stations</li>
        <li>${badge.type === 'Multiday Badge'
          ? 'This badge can only be used once per valid day'
          : 'This badge is valid for all event days'}</li>
      </ul>
    </div>
    <div class="footer">
      <p>If you have any questions, contact us at support@example.com.</p>
    </div>
  </div>
</body>
</html>`
  }

  /*─────────────────────────────────────────────────────────
    SEND ONE EMAIL
  ─────────────────────────────────────────────────────────*/
  async sendBadgeEmail(badge: BadgeEmailData): Promise<EmailResult> {

    // ─── Basic validation ────────────────────────────────
    if (!badge.email?.includes('@')) {
      return { success:false, email:badge.email, error:'Invalid email address' }
    }

    try {
      // ─── 1. create barcode ─────────────────────────────
      const base64    = await this.generateBarcodeImageServer(badge.badgeId)
      const dataUri   = `data:image/svg+xml;base64,${base64}`

      // ─── 2. build message object ───────────────────────
      const msg = {
        to: badge.email,
        from: { email:this.fromEmail, name:this.fromName },
        reply_to: { email:'support@example.com' },
        subject: `Your Event Badge – ${badge.badgeId}`,
        text: this.createPlainText(badge),
        html: this.createEmailTemplate(badge, dataUri),

        headers: {
          'List-Unsubscribe': '<mailto:unsubscribe@example.com>',
        },
      }

      // ─── 3. send ───────────────────────────────────────
      await sgMail.send(msg)
      return { success:true, email:badge.email }

    } catch (error:any) {
      console.error('Error sending badge email:', error)
      return { success:false, email:badge.email, error:error.message || 'Failed to send email' }
    }
  }

  /*─────────────────────────────────────────────────────────
    SEND MANY EMAILS (sequential to avoid rate‑limits)
  ─────────────────────────────────────────────────────────*/
  async sendBadgeEmails(badges: BadgeEmailData[]): Promise<EmailResult[]> {
    const results: EmailResult[] = []
    for (const badge of badges) {
      results.push(await this.sendBadgeEmail(badge))
      await new Promise(r => setTimeout(r, 100))   // 100 ms gap
    }
    return results
  }
}

// ───────────────────────────────────────────────────────────
export const emailService = new EmailService()
