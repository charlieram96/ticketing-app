import { google } from 'googleapis'

interface TicketData {
  id: string
  status: 'unredeemed' | 'redeemed'
  createdAt: string
  redeemedAt?: string
  resetAt?: string
  history: {
    action: 'created' | 'redeemed' | 'reset' | 'viewed'
    timestamp: string
  }[]
}

export class GoogleSheetsService {
  private sheets: any
  private spreadsheetId: string

  constructor() {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    this.sheets = google.sheets({ version: 'v4', auth })
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID || ''
  }

  async initializeSheet() {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'A1:F1',
      })

      if (!response.data.values || response.data.values.length === 0) {
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: 'A1:F1',
          valueInputOption: 'RAW',
          resource: {
            values: [['Ticket ID', 'Status', 'Created At', 'Redeemed At', 'Reset At', 'History']],
          },
        })
      }
    } catch (error) {
      console.error('Error initializing sheet:', error)
    }
  }

  async createTickets(tickets: string[]) {
    const timestamp = new Date().toISOString()
    const values = tickets.map(id => [
      id,
      'unredeemed',
      timestamp,
      '',
      '',
      JSON.stringify([{ action: 'created', timestamp }])
    ])

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: 'A:F',
      valueInputOption: 'RAW',
      resource: { values },
    })

    return tickets
  }

  async getTicket(ticketId: string): Promise<TicketData | null> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'A:F',
    })

    const rows = response.data.values || []
    const ticketRow = rows.find((row: any[]) => row[0] === ticketId)

    if (!ticketRow) return null

    return {
      id: ticketRow[0],
      status: ticketRow[1] as 'unredeemed' | 'redeemed',
      createdAt: ticketRow[2],
      redeemedAt: ticketRow[3] || undefined,
      resetAt: ticketRow[4] || undefined,
      history: JSON.parse(ticketRow[5] || '[]'),
    }
  }

  async updateTicket(ticketId: string, action: 'redeem' | 'reset' | 'view') {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'A:F',
    })

    const rows = response.data.values || []
    const rowIndex = rows.findIndex((row: any[]) => row[0] === ticketId)

    if (rowIndex === -1) return null

    const ticketRow = rows[rowIndex]
    const timestamp = new Date().toISOString()
    const history = JSON.parse(ticketRow[5] || '[]')
    history.push({ action, timestamp })

    if (action === 'redeem') {
      ticketRow[1] = 'redeemed'
      ticketRow[3] = timestamp
    } else if (action === 'reset') {
      ticketRow[1] = 'unredeemed'
      ticketRow[4] = timestamp
    }

    ticketRow[5] = JSON.stringify(history)

    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `A${rowIndex + 1}:F${rowIndex + 1}`,
      valueInputOption: 'RAW',
      resource: {
        values: [ticketRow],
      },
    })

    return this.getTicket(ticketId)
  }

  async getAllTickets(): Promise<TicketData[]> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'A:F',
    })

    const rows = response.data.values || []
    return rows.slice(1).map((row: any[]) => ({
      id: row[0],
      status: row[1] as 'unredeemed' | 'redeemed',
      createdAt: row[2],
      redeemedAt: row[3] || undefined,
      resetAt: row[4] || undefined,
      history: JSON.parse(row[5] || '[]'),
    }))
  }
}