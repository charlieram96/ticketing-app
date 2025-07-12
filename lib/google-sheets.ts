import { google } from 'googleapis'

interface TicketData {
  id: string
  status: 'unredeemed' | 'redeemed'
  createdAt: string
  redeemedAt?: string
  resetAt?: string
  validDay: 'day1' | 'day2' | 'day3' | 'day4'
  history: {
    action: 'created' | 'redeemed' | 'reset' | 'viewed'
    timestamp: string
  }[]
}

interface BadgeData {
  badgeId: string
  name: string
  department: string
  checkInHistory: {
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
        range: 'A1:G1',
      })

      if (!response.data.values || response.data.values.length === 0) {
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: 'A1:G1',
          valueInputOption: 'RAW',
          resource: {
            values: [['Ticket ID', 'Status', 'Created At', 'Redeemed At', 'Reset At', 'History', 'Valid Day']],
          },
        })
      } else {
        // Check if header has all columns
        const header = response.data.values[0]
        if (header.length < 7 || header[6] !== 'Valid Day') {
          // Update header to include Valid Day
          await this.sheets.spreadsheets.values.update({
            spreadsheetId: this.spreadsheetId,
            range: 'A1:G1',
            valueInputOption: 'RAW',
            resource: {
              values: [['Ticket ID', 'Status', 'Created At', 'Redeemed At', 'Reset At', 'History', 'Valid Day']],
            },
          })
        }
      }

      // Migrate existing data to ensure all rows have 7 columns
      await this.migrateExistingData()
    } catch (error) {
      console.error('Error initializing sheet:', error)
    }
  }

  async migrateExistingData() {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'A:G',
      })

      const rows = response.data.values || []
      if (rows.length <= 1) return // No data to migrate

      let needsUpdate = false
      const updatedRows = rows.map((row: any[], index: number) => {
        if (index === 0) return row // Skip header
        
        // Ensure each row has 7 columns
        if (row.length < 7) {
          needsUpdate = true
          const newRow = [...row]
          
          // Ensure we have at least 6 columns (add empty strings if needed)
          while (newRow.length < 6) {
            newRow.push('')
          }
          
          // If column 6 doesn't exist or is empty, add default validDay
          if (!newRow[6]) {
            newRow[6] = 'day1'
          }
          
          return newRow
        }
        return row
      })

      if (needsUpdate) {
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: 'A:G',
          valueInputOption: 'RAW',
          resource: { values: updatedRows },
        })
      }
    } catch (error) {
      console.error('Error migrating data:', error)
    }
  }

  async createTickets(tickets: string[], validDay: 'day1' | 'day2' | 'day3' | 'day4' = 'day1') {
    const timestamp = new Date().toISOString()
    const values = tickets.map(id => [
      id,
      'unredeemed',
      timestamp,
      '',
      '',
      JSON.stringify([{ action: 'created', timestamp }]),
      validDay
    ])

    // First get the current data to find the next row
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'A:A',
    })

    const rows = response.data.values || []
    const nextRow = rows.length + 1

    // Update specific range starting from column A
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `A${nextRow}:G${nextRow + values.length - 1}`,
      valueInputOption: 'RAW',
      resource: { values },
    })

    return tickets
  }

  async getTicket(ticketId: string): Promise<TicketData | null> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'A:G',
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
      validDay: (ticketRow[6] || 'day1') as 'day1' | 'day2' | 'day3' | 'day4',
      history: JSON.parse(ticketRow[5] || '[]'),
    }
  }

  async updateTicket(ticketId: string, action: 'redeem' | 'reset' | 'view') {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'A:G',
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
      range: `A${rowIndex + 1}:G${rowIndex + 1}`,
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
      range: 'A:G',
    })

    const rows = response.data.values || []
    return rows.slice(1).map((row: any[]) => ({
      id: row[0],
      status: row[1] as 'unredeemed' | 'redeemed',
      createdAt: row[2],
      redeemedAt: row[3] || undefined,
      resetAt: row[4] || undefined,
      validDay: (row[6] || 'day1') as 'day1' | 'day2' | 'day3' | 'day4',
      history: JSON.parse(row[5] || '[]'),
    }))
  }

  async getAllBadges(): Promise<BadgeData[]> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'Badges!A:D',
    })

    const rows = response.data.values || []
    if (rows.length <= 1) return []
    
    return rows.slice(1).map((row: any[]) => ({
      badgeId: row[0] || '',
      name: row[1] || '',
      department: row[2] || '',
      checkInHistory: JSON.parse(row[3] || '[]'),
    }))
  }

  async getBadge(badgeId: string): Promise<BadgeData | null> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'Badges!A:D',
    })

    const rows = response.data.values || []
    const badgeRow = rows.find((row: any[]) => row[0] === badgeId)

    if (!badgeRow) return null

    return {
      badgeId: badgeRow[0],
      name: badgeRow[1] || '',
      department: badgeRow[2] || '',
      checkInHistory: JSON.parse(badgeRow[3] || '[]'),
    }
  }

  async updateBadgeCheckIn(badgeId: string): Promise<BadgeData | null> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'Badges!A:D',
    })

    const rows = response.data.values || []
    const rowIndex = rows.findIndex((row: any[]) => row[0] === badgeId)

    if (rowIndex === -1) return null

    const badgeRow = rows[rowIndex]
    const timestamp = new Date().toISOString()
    const checkInHistory = JSON.parse(badgeRow[3] || '[]')
    checkInHistory.push({ timestamp })

    badgeRow[3] = JSON.stringify(checkInHistory)

    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `Badges!A${rowIndex + 1}:D${rowIndex + 1}`,
      valueInputOption: 'RAW',
      resource: {
        values: [badgeRow],
      },
    })

    return this.getBadge(badgeId)
  }
}