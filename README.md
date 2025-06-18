# Ticketing System Web App

A modern, high-performance ticketing system built with Next.js, featuring QR code and barcode scanning capabilities with Google Sheets integration.

## Features

- **3 Scanning Modes**:
  - **Check-in Mode**: Marks tickets as "redeemed"
  - **View Mode**: Displays ticket status and history
  - **Reset Mode**: Resets tickets to "unredeemed" status

- **Ticket Generation**: Bulk generate unique ticket IDs with QR codes and barcodes
- **Real-time Scanning**: Fast QR code and barcode scanning with instant feedback
- **Google Sheets Integration**: All ticket data stored in Google Sheets
- **Print-ready Tickets**: Generate and print tickets with both QR codes and barcodes
- **Beautiful UI**: Modern, animated interface with glass-morphism effects
- **Password Protection**: Simple password authentication system

## Setup Instructions

1. **Clone the repository and install dependencies**:
   ```bash
   cd ticketing-app
   npm install
   ```

2. **Configure Google Sheets**:
   - Create a new Google Sheet
   - Set up a Google Cloud service account with Sheets API enabled
   - Download the service account credentials JSON
   - Share your Google Sheet with the service account email

3. **Set up environment variables**:
   Edit the `.env.local` file with your credentials:
   ```
   SYSTEM_PASSWORD=your_password_here
   GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_SHEETS_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
   GOOGLE_SHEET_ID="your_google_sheet_id"
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Access the app**:
   Open [http://localhost:3000](http://localhost:3000) and login with your password

## Deployment

Deploy to Vercel:
```bash
vercel
```

Make sure to add your environment variables in the Vercel dashboard.

## Usage

1. **Login**: Use the password configured in `SYSTEM_PASSWORD`
2. **Generate Tickets**: Click "Generate" to create new tickets
3. **Scan Tickets**: Select a mode and start scanning
4. **View All Tickets**: Click "Manage Tickets" to see all tickets and their status

## Ticket ID Format

Tickets are generated with the format: `TKT-XXXXXXXX` (8 random alphanumeric characters)

## Technologies Used

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Google Sheets API
- html5-qrcode (scanning)
- react-qr-code & jsbarcode (generation)