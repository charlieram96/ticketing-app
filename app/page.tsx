'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { QrCode, Ticket, LogOut, Plus, Scan, BadgeCheck } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Scanner from '@/components/Scanner'
import ScanResult from '@/components/ScanResult'
import Image from 'next/image'
import logo from '@/public/Todo_Nuevo_Wave_FINAL_Color.png'

export default function Home() {
  const [scanResult, setScanResult] = useState<any>(null)
  const router = useRouter()
  const userRole = Cookies.get('userRole') || 'admin'

  const handleLogout = () => {
    Cookies.remove('authenticated')
    Cookies.remove('userRole')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>
      <div className="relative z-10">
      {/* Header */}
      <header className="bg-white">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">

              <div>
                <Image src={logo} alt="Logo" width={120} height={120} />
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-3">
              {userRole === 'admin' && (
                <>
                  <Link href="/tickets">
                    <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-50 px-2 sm:px-4">
                      <Ticket className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Tickets</span>
                    </Button>
                  </Link>
                  <Link href="/badges">
                    <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-50 px-2 sm:px-4">
                      <BadgeCheck className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Badges</span>
                    </Button>
                  </Link>
                  <Link href="/generate">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 px-2 sm:px-4">
                      <Plus className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Generate</span>
                    </Button>
                  </Link>
                </>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="px-2 sm:px-4"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl"
        >
          {/* Hero Section */}
          <div className="mb-8 sm:mb-12 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mb-6"
            >
              <Badge variant="secondary" className="mb-3 sm:mb-4 bg-blue-50 text-blue-600 border-blue-200">
                <Scan className="mr-1 h-3 w-3" />
                <span className="hidden sm:inline">Professional </span>Scanning System
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
                Scan Tickets
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                Select a scanning mode and start processing barcodes with real-time feedback and instant results
              </p>
            </motion.div>
          </div>

          {/* Scanner Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-gray-50/50">
              <CardHeader className="text-center">
                <CardTitle className="text-gray-900">Scanner Control</CardTitle>
                <CardDescription className="text-gray-600">
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
            className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
          >
            <Card className="bg-gray-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-full bg-green-100 p-2">
                    <QrCode className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Check-in Mode</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Instantly redeem tickets and mark them as used with real-time validation
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-full bg-blue-100 p-2">
                    <Scan className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">View Mode</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Display ticket details, status, and complete usage history
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-full bg-orange-100 p-2">
                    <LogOut className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Reset Mode</h3>
                </div>
                <p className="text-sm text-gray-600">
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
    </div>
  )
}