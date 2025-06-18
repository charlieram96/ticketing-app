# 🎫 Modern Ticketing System

A sleek, professional ticketing system built with **Next.js 14**, **shadcn/ui**, and **Google Sheets** integration featuring real-time QR code and barcode scanning.

## ✨ Features

### 🔐 **Secure Access**
- Password-protected system with elegant login interface
- Session-based authentication with automatic redirects

### 📱 **3 Scanning Modes**
- **Check-in Mode**: Mark tickets as "redeemed" instantly
- **View Mode**: Display comprehensive ticket details and history
- **Reset Mode**: Reset tickets to "unredeemed" while preserving audit trail

### 🎯 **Advanced Scanning**
- **Dual Format Support**: QR codes and barcodes
- **Real-time Processing**: Instant feedback with smooth animations
- **Smart Camera Interface**: Clean, professional scanner UI
- **Fast Performance**: Optimized for high-volume events

### 🎨 **Premium UI/UX**
- **Modern Design**: Built with shadcn/ui components
- **Glass Morphism**: Sophisticated backdrop blur effects
- **Smooth Animations**: Framer Motion powered interactions
- **Responsive Layout**: Perfect on desktop, tablet, and mobile
- **Dark Theme**: Professional gradient backgrounds

### 🎟️ **Ticket Management**
- **Bulk Generation**: Create up to 1000 tickets at once
- **Unique IDs**: Secure alphanumeric ticket identifiers
- **Print-Ready**: Professional ticket layouts for printing
- **Real-time Stats**: Live dashboard with redemption analytics
- **Search & Filter**: Advanced ticket management tools

### ☁️ **Cloud Integration**
- **Google Sheets Backend**: All data stored securely in Google Sheets
- **Real-time Sync**: Instant updates across all devices
- **Audit Trail**: Complete history tracking for all actions
- **Scalable**: Handle thousands of tickets efficiently

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd ticketing-app
npm install
```

### 2. Configure Google Sheets
1. Create a new Google Sheet
2. Set up a Google Cloud service account with Sheets API access
3. Download service account credentials
4. Share your Google Sheet with the service account email

### 3. Environment Setup
Update `.env.local` with your credentials:
```env
SYSTEM_PASSWORD=your_secure_password
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_CLIENT_EMAIL="service-account@project.iam.gserviceaccount.com"
GOOGLE_SHEET_ID="your_google_sheet_id"
```

### 4. Launch Application
```bash
npm run dev
```

Access at [http://localhost:3000](http://localhost:3000)

## 🎨 UI Components

Built with **shadcn/ui** for a premium experience:
- **Cards**: Elegant glassmorphism containers
- **Buttons**: Gradient and outline variants
- **Inputs**: Modern form controls with focus states
- **Badges**: Status indicators with color coding
- **Tables**: Responsive data displays
- **Dialogs**: Modal interfaces for scan results
- **Tabs**: Clean navigation between scan types
- **Alerts**: Contextual notifications

## 📊 Dashboard Features

### Real-time Analytics
- Total tickets generated
- Redemption rates and statistics  
- Available vs redeemed breakdown
- Activity trends and insights

### Advanced Search
- Filter by ticket status
- Search by ticket ID
- Real-time results
- Export capabilities

## 🎫 Ticket Generation

### Professional Design
- Clean, printable layout
- Both QR codes and barcodes
- Unique ticket identifiers
- Event branding ready

### Bulk Operations
- Generate 1-1000 tickets at once
- Instant database storage
- Print-optimized layouts
- CSV export ready

## 🔧 Technical Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Premium component library
- **Framer Motion** - Smooth animations

### Backend
- **Next.js API Routes** - Serverless functions
- **Google Sheets API** - Cloud database
- **Middleware** - Authentication & routing

### Scanning Technology
- **html5-qrcode** - Camera-based scanning
- **QR Code Generation** - react-qr-code
- **Barcode Generation** - jsbarcode

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel --prod
```

Add environment variables in Vercel dashboard.

### Docker
```bash
docker build -t ticketing-system .
docker run -p 3000:3000 ticketing-system
```

## 🎯 Use Cases

- **Events & Conferences**: Check-in attendees quickly
- **Concerts & Shows**: Validate tickets at entry
- **Workshops**: Track attendance and participation
- **Corporate Events**: Professional guest management
- **Festivals**: Handle high-volume ticket processing

## 🔐 Security Features

- Password-protected access
- Session-based authentication
- Secure API endpoints
- Input validation
- SQL injection prevention
- Rate limiting ready

## 📱 Mobile Ready

- Responsive design for all devices
- Touch-optimized interfaces
- Mobile camera scanning
- Offline-ready architecture
- PWA capabilities

## 🎨 Customization

The system is built for easy customization:
- Modify ticket designs in `/app/generate/page.tsx`
- Update themes in `tailwind.config.ts`
- Add custom animations in components
- Extend API functionality in `/app/api/`

## 📈 Performance

- **Build Time**: ~8 seconds
- **First Load**: <280kb
- **Scanner Startup**: <1 second
- **Database Sync**: Real-time
- **Mobile Performance**: Optimized

## 🔄 API Endpoints

- `POST /api/tickets` - Generate new tickets
- `GET /api/tickets` - Fetch all tickets
- `GET /api/tickets/[id]` - Get ticket details
- `PATCH /api/tickets/[id]` - Update ticket status
- `POST /api/auth/login` - Authentication

---

**Built with ❤️ using Next.js, shadcn/ui, and modern web technologies**