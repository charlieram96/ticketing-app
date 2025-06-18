'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { QrCode, Ticket, LogOut, Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                className="bg-gradient-to-br from-purple-600 to-blue-600 p-2 rounded-lg"
              >
                <QrCode className="w-6 h-6 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white">Ticket Scanner</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/tickets">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-white/20 transition-all"
                >
                  <Ticket className="w-5 h-5" />
                  Manage Tickets
                </motion.button>
              </Link>
              <Link href="/generate">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Generate
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="bg-red-600/20 backdrop-blur-sm text-red-400 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-red-600/30 transition-all"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </motion.button>
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
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-4">
              Scan Tickets
            </h2>
            <p className="text-white/60 text-lg">
              Select a mode and start scanning QR codes or barcodes
            </p>
          </div>

          <Scanner onScanResult={setScanResult} />
        </motion.div>
      </main>

      {/* Scan Result Modal */}
      <ScanResult result={scanResult} onClose={() => setScanResult(null)} />
    </div>
  )
}