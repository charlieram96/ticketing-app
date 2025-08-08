import sgMail from '@sendgrid/mail'
import JsBarcode from 'jsbarcode'
import { createCanvas } from 'canvas'
import AWS from 'aws-sdk'

// ───────────────────────────────────────────────────────────
//  INITIALISE SENDGRID
// ───────────────────────────────────────────────────────────
if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY env‑var is missing')
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// ───────────────────────────────────────────────────────────
//  INITIALISE AWS S3
// ───────────────────────────────────────────────────────────
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
})

const s3 = new AWS.S3()

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
  department: string
  type: 'Badge' | 'Multiday Badge'
  days: number[]
  companion?: string
}

// ───────────────────────────────────────────────────────────
//  HELPER FUNCTIONS
// ───────────────────────────────────────────────────────────
async function uploadBarcodeToS3(badgeId: string, barcodeBuffer: Buffer): Promise<string> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME!
  const region = process.env.AWS_REGION || 'us-east-1'
  
  const params = {
    Bucket: bucketName,
    Key: `barcodes/${badgeId}.png`, // File path in the bucket
    Body: barcodeBuffer,
    ContentType: 'image/png',
    ACL: 'public-read', // Make the file publicly readable
    CacheControl: 'public, max-age=31536000', // Cache for 1 year
    ContentDisposition: 'inline', // Display inline, not as download
  }

  await s3.upload(params).promise()
  
  // Return the direct HTTPS URL with no redirects
  const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/barcodes/${badgeId}.png`
  console.log(`[S3 Upload] Barcode uploaded successfully:`)
  console.log(`  Badge ID: ${badgeId}`)
  console.log(`  S3 URL: ${s3Url}`)
  console.log(`  Bucket: ${bucketName}`)
  console.log(`  Region: ${region}`)
  
  return s3Url
}

// ───────────────────────────────────────────────────────────
//  SERVICE
// ───────────────────────────────────────────────────────────
export class EmailService {
  private fromEmail: string
  private fromName: string
  private bccEmail: string

  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'ticketing@fll2025.com'
    this.fromName  = process.env.FROM_NAME  || 'FLL 2025 Ticketing'
    this.bccEmail = process.env.BCC_EMAIL || 'charlie@fll2025.com'
  }

  /*─────────────────────────────────────────────────────────
    GENERATE BARCODE AND UPLOAD TO S3
  ─────────────────────────────────────────────────────────*/
  private async generateBarcodeImageServer(badgeId: string): Promise<string> {
    try {
      // ── 1.  Dimensions ───────────────────────────────
      const OUT_W = 600;                   // displayed width  (px)
      const OUT_H = Math.round(OUT_W / 9.2); // 65 px – height = width/9.2
      const SCALE = 2;                     // render @2× for Retina
  
      // ── 2.  Create hi-res canvas ─────────────────────
      const canvas = createCanvas(OUT_W * SCALE, OUT_H * SCALE);
      const ctx    = canvas.getContext('2d');
  
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
  
      // ── 3.  Render barcode directly on that canvas ───
      JsBarcode(canvas, badgeId, {
        format:       'CODE128',
        width:        2 * SCALE,          // module 2 px @1×
        height:       OUT_H * SCALE,
        margin:       0,
        displayValue: false,
        flat:         true
      });
  
      // ── 4.  Encode PNG & upload ──────────────────────
      const png = canvas.toBuffer('image/png');
      return await uploadBarcodeToS3(badgeId, png);
  
    } catch (err) {
      console.error('Barcode generation failed, using fallback:', err);
  
      // ── 5.  Fallback: plain text inside a frame ──────
      const fallbackW = 600;
      const fallbackH = Math.round(fallbackW / 9.2);
      const fbCanvas  = createCanvas(fallbackW, fallbackH);
      const fbCtx     = fbCanvas.getContext('2d');
  
      fbCtx.fillStyle = '#FFFFFF';
      fbCtx.fillRect(0, 0, fallbackW, fallbackH);
  
      fbCtx.strokeStyle = '#000000';
      fbCtx.lineWidth   = 2;
      fbCtx.strokeRect(0, 0, fallbackW, fallbackH);
  
      fbCtx.fillStyle   = '#000000';
      fbCtx.font        = 'bold 24px monospace';
      fbCtx.textAlign   = 'center';
      fbCtx.textBaseline= 'middle';
      fbCtx.fillText(badgeId, fallbackW / 2, fallbackH / 2);
  
      const png = fbCanvas.toBuffer('image/png');
      return await uploadBarcodeToS3(badgeId, png);
    }
  }

  /*─────────────────────────────────────────────────────────
    PLAIN‑TEXT MIME PART  (improves deliverability)
  ─────────────────────────────────────────────────────────*/
  private createPlainText(badge: BadgeEmailData): string {
    const validDaysText = this.formatValidDays(badge)
    
    return [
      `Hola ${badge.name},`,
      '',
      'Nos complace informarte que has sido invitado a asistir a nuestra tarde de esparcimiento para la Asamblea Especial de Fort Lauderdale 2025!',
      '',
      `Tu código de entrada: ${badge.badgeId}`,
      '',
      'VALIDEZ DE TU ENTRADA:',
      validDaysText,
      '',
      'DETALLES DEL EVENTO:',
      'Fecha: Martes, Agosto 12, 2025',
      'Hora: 9am - 2pm',
      'Ubicación: West Palm Beach Christian Convention Center of Jehovah\'s Witnesses',
      'Dirección: 1610 Palm Beach Lakes Blvd, West Palm Beach, FL 33401',
      '',
      'Por favor presenta este correo electrónico con el código de barras en la entrada.',
      '',
      '— Fort Lauderdale 2025'
    ].join('\n')
  }

  /*─────────────────────────────────────────────────────────
    GET DAY NAME WITH DATE
  ─────────────────────────────────────────────────────────*/
  private getDayWithDate(dayNumber: number): string {
    const dayMap: { [key: number]: string } = {
      1: 'Viernes 8 de Agosto',
      2: 'Sábado 9 de Agosto',
      3: 'Martes 12 de Agosto',
      4: 'Miércoles 13 de Agosto',
      5: 'Lunes 18 de Agosto'
    }
    return dayMap[dayNumber] || `Día ${dayNumber}`
  }

  /*─────────────────────────────────────────────────────────
    FORMAT VALID DAYS TEXT
  ─────────────────────────────────────────────────────────*/
  private formatValidDays(badge: BadgeEmailData): string {
    if (badge.type === 'Badge') {
      return 'Tu entrada es válida para todos los días del evento'
    } else if (badge.days.length === 1) {
      return `Tu entrada es válida para ${this.getDayWithDate(badge.days[0])} únicamente`
    } else if (badge.days.length === 2) {
      return `Tu entrada es válida para ${this.getDayWithDate(badge.days[0])} y ${this.getDayWithDate(badge.days[1])}`
    } else {
      const daysCopy = [...badge.days] // Don't mutate original array
      const lastDay = daysCopy.pop()
      const daysWithDates = daysCopy.map(day => this.getDayWithDate(day))
      return `Tu entrada es válida para ${daysWithDates.join(', ')} y ${this.getDayWithDate(lastDay!)}`
    }
  }

  /*─────────────────────────────────────────────────────────
    FORMAT VALID DAYS WITH DATES
  ─────────────────────────────────────────────────────────*/
  private formatValidDaysWithDates(badge: BadgeEmailData): string {
    if (badge.type === 'Badge') {
      return `<strong>Todos los días del evento:</strong><br>
        • Viernes 8 de Agosto<br>
        • Sábado 9 de Agosto<br>
        • Martes 12 de Agosto<br>
        • Miércoles 13 de Agosto<br>
        • Lunes 18 de Agosto`
    } else {
      const daysHtml = badge.days.map(day => 
        `• ${this.getDayWithDate(day)}`
      ).join('<br>')
      return `<strong>Días válidos:</strong><br>${daysHtml}`
    }
  }

  /*─────────────────────────────────────────────────────────
    HTML MIME PART
  ─────────────────────────────────────────────────────────*/
  private async createEmailTemplate(badge: BadgeEmailData, barcodeUrl: string): Promise<string> {
    const validDaysText = this.formatValidDays(badge)

    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
            <html data-editor-version="2" class="sg-campaigns" xmlns="http://www.w3.org/1999/xhtml">
                <head>
                  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">
                  <meta http-equiv="X-UA-Compatible" content="IE=Edge">
            
                  <style type="text/css">
                body, p, div {
                  font-family: arial,helvetica,sans-serif;
                  font-size: 14px;
                }
                body {
                  color: #000000;
                }
                body a {
                  color: #000000;
                  text-decoration: none;
                }
                p { margin: 0; padding: 0; }
                table.wrapper {
                  width:100% !important;
                  table-layout: fixed;
                  -webkit-font-smoothing: antialiased;
                  -webkit-text-size-adjust: 100%;
                  -moz-text-size-adjust: 100%;
                  -ms-text-size-adjust: 100%;
                }
                img.max-width {
                  max-width: 100% !important;
                }
                .column.of-2 {
                  width: 50%;
                }
                .column.of-3 {
                  width: 33.333%;
                }
                .column.of-4 {
                  width: 25%;
                }
                ul ul ul ul  {
                  list-style-type: disc !important;
                }
                ol ol {
                  list-style-type: lower-roman !important;
                }
                ol ol ol {
                  list-style-type: lower-latin !important;
                }
                ol ol ol ol {
                  list-style-type: decimal !important;
                }
                @media screen and (max-width:480px) {
                  .preheader .rightColumnContent,
                  .footer .rightColumnContent {
                    text-align: left !important;
                  }
                  .preheader .rightColumnContent div,
                  .preheader .rightColumnContent span,
                  .footer .rightColumnContent div,
                  .footer .rightColumnContent span {
                    text-align: left !important;
                  }
                  .preheader .rightColumnContent,
                  .preheader .leftColumnContent {
                    font-size: 80% !important;
                    padding: 5px 0;
                  }
                  table.wrapper-mobile {
                    width: 100% !important;
                    table-layout: fixed;
                  }
                  img.max-width {
                    height: auto !important;
                    max-width: 100% !important;
                  }
                  a.bulletproof-button {
                    display: block !important;
                    width: auto !important;
                    font-size: 80%;
                    padding-left: 0 !important;
                    padding-right: 0 !important;
                  }
                  .columns {
                    width: 100% !important;
                  }
                  .column {
                    display: block !important;
                    width: 100% !important;
                    padding-left: 0 !important;
                    padding-right: 0 !important;
                    margin-left: 0 !important;
                    margin-right: 0 !important;
                  }
                  .social-icon-column {
                    display: inline-block !important;
                  }
                }
              </style>
                </head>
                <body>
                  <center class="wrapper" data-link-color="#000000" data-body-style="font-size:14px; font-family:arial,helvetica,sans-serif; color:#000000; background-color:#e8fcff;">
                    <div class="webkit">
                      <table cellpadding="0" cellspacing="0" border="0" width="100%" class="wrapper" bgcolor="#e8fcff">
                        <tr>
                          <td valign="top" bgcolor="#e8fcff" width="100%">
                            <table width="100%" role="content-container" class="outer" align="center" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td width="100%">
                                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                      <td>
            
                                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px;" align="center">
                                                  <tr>
                                                    <td role="modules-container" style="padding:0px 0px 0px 0px; color:#000000; text-align:left;" bgcolor="#ffffff" width="100%" align="left"><table class="module preheader preheader-hide" role="module" data-type="preheader" border="0" cellpadding="0" cellspacing="0" width="100%" style="display: none !important; mso-hide: all; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">
                <tr>
                  <td role="module-content">
                    <p>Corrección sobre el día viernes 8 de Agosto – Departamento de Alimentos</p>
                  </td>
                </tr>
              </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="7657ff89-b997-4619-aff2-72eeece02494" data-mc-module-version="2019-10-22">
                
              </table><table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:20px 0px 20px 0px;" bgcolor="#ffffff" data-distribution="1">
                <tbody>
                  <tr role="module-content">
                    <td height="100%" valign="top"><table width="600" style="width:600px; border-spacing:0; border-collapse:collapse; margin:0px 0px 0px 0px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
                  <tbody>
                    <tr>
                      <td style="padding:0px;margin:0px;border-spacing:0;"><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="9f29c991-6500-41ef-9f0e-d56cb5dc1238">
                <tbody>
                  <tr>
                    
                  </tr>
                </tbody>
              </table></td>
                    </tr>
                  </tbody>
                </table></td>
                  </tr>
                </tbody>
              </table><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="7bf3c8d1-3ee5-43af-91f2-1ef67b1f878c">
                <tbody>
                  <tr>
                    <td style="padding:20px 0px;" align="center">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                        <tr>
                          <td width="50%" style="padding:0 10px;" valign="middle" align="center">
                            <img border="0" style="display:block; max-width:100%; height:auto;" width="250" alt="Fort Lauderdale 2025" src="https://lessthan7.studio/media/fort-lauderdale-2025-logo-final.png">
                          </td>
                          <td width="50%" style="padding:0 10px;" valign="middle" align="center">
                            <img border="0" style="display:block; max-width:100%; height:auto;" width="250" alt="Todo Nuevo" src="https://lessthan7.studio/media/todo-nuevo.png">
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
             <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="b35b8ff4-8b3c-4b35-9ed3-f9f25170affc" data-mc-module-version="2019-10-22">
              <tbody>
                <tr>
                  <td style="padding:40px 20px 18px 20px; line-height:28px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content">
                    <div style="font-family: inherit; text-align: left">
                      <span style="color: #273159; font-size: 16px; font-family: 'lucida sans unicode', 'lucida grande', sans-serif">
                        Hola hermano(a)s,
                        <br><br>
                        Queremos informarle que <em>incorrectamente</em> le añadimos a la mayoría de los voluntarios que están trabajando en el departamento de <b>Alimentos</b> el día viernes 8 de Agosto como uno de los días que estarán trabajando. Si su overseer no le pidió trabajar el viernes 8 de Agosto y no tiene un ticket, por favor no vaya al salón de asamblea de West Palm Beach pues no se le permitirá la entrada.
                        <br><br>
                        Cualquier pregunta que tengan, por favor respondan directamente a este email.
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            </td>
                    </tr>
                  </tbody>
                </table></td>
                  </tr>
                </tbody>
              </table><table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:0px 20px 20px 20px;" bgcolor="#FFFFFF" data-distribution="1">
                <tbody>
                  <tr role="module-content">
                    <td height="100%" valign="top"><table width="560" style="width:560px; border-spacing:0; border-collapse:collapse; margin:0px 0px 0px 0px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
                  <tbody>
                    <tr>
                      <td style="padding:0px;margin:0px;border-spacing:0;"><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="3cfcd060-6f0a-47e2-9865-855bcde54de7" data-mc-module-version="2019-10-22">
                
              </table></td>
                    </tr>
                  </tbody>
                </table></td>
                  </tr>
                </tbody>
              </table><table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:0px 20px 0px 20px;" bgcolor="#ffffff" data-distribution="1">
                <tbody>
                  <tr role="module-content">
                    <td height="100%" valign="top"><table width="560" style="width:560px; border-spacing:0; border-collapse:collapse; margin:0px 0px 0px 0px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
                  <tbody>
                    <tr>
                      <td style="padding:0px;margin:0px;border-spacing:0;"><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="e763c2de-823c-4c4a-addc-a1f84fc2c8a0.1">
                
              </table></td>
                    </tr>
                  </tbody>
                </table></td>
                  </tr>
                </tbody>
              </table><table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:0px 20px 0px 20px;" bgcolor="#FFFFFF" data-distribution="1">
                <tbody>
                  <tr role="module-content">
                    <td height="100%" valign="top"><table width="560" style="width:560px; border-spacing:0; border-collapse:collapse; margin:0px 0px 0px 0px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
                  <tbody>
                    <tr>
                      <td style="padding:0px;margin:0px;border-spacing:0;"><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="3cfcd060-6f0a-47e2-9865-855bcde54de7.1" data-mc-module-version="2019-10-22">
                
              </table></td>
                    </tr>
                  </tbody>
                </table></td>
                  </tr>
                </tbody>
              </table><table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:0px 20px 0px 20px;" bgcolor="#FFFFFF" data-distribution="1">
                <tbody>
                  <tr role="module-content">
                    <td height="100%" valign="top"><table width="560" style="width:560px; border-spacing:0; border-collapse:collapse; margin:0px 0px 0px 0px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
                  <tbody>
                    <tr>
                      <td style="padding:0px;margin:0px;border-spacing:0;"><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="a49405df-a253-4a28-8d3d-be95449c7d30" data-mc-module-version="2019-10-22">
                
              </table></td>
                    </tr>
                  </tbody>
                </table></td>
                  </tr>
                </tbody>
              </table>
              
              
             <table border="0" cellpadding="0" cellspacing="0" class="module" data-role="module-button" data-type="button" role="module" style="table-layout:fixed;" width="100%" data-muid="ac83dab5-fb19-4d55-9b6e-79fd3596622f">
                  <tbody>
                    <tr>
                      <td align="center" bgcolor="" class="outer-td" style="padding:0px 0px 20px 0px;">
                        <table border="0" cellpadding="0" cellspacing="0" class="wrapper-mobile" style="text-align:center;">
                          <tbody>
            
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table></td>
                                                  </tr>
                                                </table>
                                                <!--[if mso]>
                                              </td>
                                            </tr>
                                          </table>
                                        </center>
                                        <![endif]-->
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </center>
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
      // ─── 1. Generate barcode and upload to S3 ────────
      const barcodeUrl = await this.generateBarcodeImageServer(badge.badgeId)
      
      // ─── 2. Generate HTML with S3 barcode URL ────────
      const htmlContent = await this.createEmailTemplate(badge, barcodeUrl)
      console.log(`[Email] Preparing to send email to: ${badge.email}`)
      console.log(`[Email] Barcode URL in email: ${barcodeUrl}`)

      // ─── 3. build message object ───────────────────────
      // Note: For better deliverability, ensure your domain has proper SPF, DKIM, and DMARC records configured
      const msg = {
        to: badge.email,
        bcc: this.bccEmail, // BCC charlie@fll2025.com for record keeping
        from: { email:this.fromEmail, name:this.fromName },
        replyTo: 'ticketing@fll2025.com', // Use replyTo instead of reply_to
        subject: `Tu entrada Fort Lauderdale 2025 - ${badge.badgeId}`, // More specific subject with badge ID
        text: this.createPlainText(badge),
        html: htmlContent,
        // No attachments needed since barcode is hosted on S3
        headers: {
          'X-Priority': '3', // Normal priority
          'X-Mailer': 'Fort Lauderdale 2025 Event System',
          // Don't set Content-Type here - SendGrid handles it automatically
        },
      }

      // ─── 4. send ───────────────────────────────────────
      await sgMail.send(msg)
      return { success:true, email:badge.email }

    } catch (error:any) {
      console.error('[Email Error] Failed to send badge email:')
      console.error(`  Badge ID: ${badge.badgeId}`)
      console.error(`  Email: ${badge.email}`)
      console.error(`  Error: ${error.message}`)
      console.error(`  Stack: ${error.stack}`)
      
      // Check for specific SendGrid errors
      if (error.response && error.response.body && error.response.body.errors) {
        console.error('[SendGrid Errors]:', JSON.stringify(error.response.body.errors, null, 2))
      }
      
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
