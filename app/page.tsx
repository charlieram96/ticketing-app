'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { QrCode, Ticket, LogOut, Plus, Scan } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Scanner from '@/components/Scanner'
import ScanResult from '@/components/ScanResult'

export default function Home() {
  const [scanResult, setScanResult] = useState<any>(null)
  const router = useRouter()

  const handleLogout = () => {
    Cookies.remove('authenticated')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse' }}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600"
              >
                <QrCode className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-white">Ticket Scanner</h1>
                <p className="text-sm text-white/60">Professional ticketing system</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/tickets">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <Ticket className="mr-2 h-4 w-4" />
                  Manage Tickets
                </Button>
              </Link>
              <Link href="/generate">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Generate
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="bg-red-600/20 text-red-400 hover:bg-red-600/30"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl"
        >
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mb-6"
            >
              <Badge variant="secondary" className="mb-4 bg-purple-600/20 text-purple-300">
                <Scan className="mr-1 h-3 w-3" />
                Professional Scanning System
              </Badge>
              <h2 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Scan Tickets
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Select a scanning mode and start processing QR codes or barcodes with real-time feedback and instant results
              </p>
            </motion.div>
          </div>

          {/* Scanner Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="border-white/10 bg-black/30 backdrop-blur-md">
              <CardHeader className="text-center">
                <CardTitle className="text-white">Scanner Control</CardTitle>
                <CardDescription className="text-white/60">
                  Choose your scanning mode and start processing tickets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Scanner onScanResult={setScanResult} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Card className="border-green-500/20 bg-green-500/5 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-full bg-green-500/20 p-2">
                    <QrCode className="h-5 w-5 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-white">Check-in Mode</h3>
                </div>
                <p className="text-sm text-white/60">
                  Instantly redeem tickets and mark them as used with real-time validation
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-500/20 bg-blue-500/5 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-full bg-blue-500/20 p-2">
                    <Scan className="h-5 w-5 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-white">View Mode</h3>
                </div>
                <p className="text-sm text-white/60">
                  Display ticket details, status, and complete usage history
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-500/20 bg-orange-500/5 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-full bg-orange-500/20 p-2">
                    <LogOut className="h-5 w-5 text-orange-400" />
                  </div>
                  <h3 className="font-semibold text-white">Reset Mode</h3>
                </div>
                <p className="text-sm text-white/60">
                  Reset tickets to unredeemed status while preserving history
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>

      {/* Scan Result Modal */}
      <ScanResult result={scanResult} onClose={() => setScanResult(null)} />
    </div>
  )
}