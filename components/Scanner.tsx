'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, Barcode, CheckCircle, XCircle, Eye, RotateCcw, Loader2 } from 'lucide-react'

type ScanMode = 'check-in' | 'view' | 'reset'
type ScanType = 'qr' | 'barcode'

interface ScanResult {
  ticketId: string
  status: 'unredeemed' | 'redeemed'
  message: string
  success: boolean
  details?: any
}

interface ScannerProps {
  onScanResult: (result: ScanResult) => void
}

export default function Scanner({ onScanResult }: ScannerProps) {
  const [mode, setMode] = useState<ScanMode>('check-in')
  const [scanType, setScanType] = useState<ScanType>('qr')
  const [isScanning, setIsScanning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const scannerElementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isScanning && scannerElementRef.current) {
      const config = {
        fps: 10,
        qrbox: scanType === 'qr' ? { width: 250, height: 250 } : { width: 300, height: 150 },
        supportedScanTypes: scanType === 'qr' 
          ? [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
          : [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      }

      scannerRef.current = new Html5QrcodeScanner('scanner-container', config, false)
      
      scannerRef.current.render(
        async (decodedText) => {
          if (!isProcessing) {
            await handleScan(decodedText)
          }
        },
        (error) => {
          console.log('Scan error:', error)
        }
      )
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear()
        scannerRef.current = null
      }
    }
  }, [isScanning, scanType, mode])

  const handleScan = async (ticketId: string) => {
    setIsProcessing(true)
    
    try {
      const action = mode === 'check-in' ? 'redeem' : mode === 'reset' ? 'reset' : 'view'
      
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      const data = await response.json()

      if (response.ok) {
        const result: ScanResult = {
          ticketId,
          status: data.status,
          success: true,
          message: mode === 'check-in' 
            ? 'Ticket successfully checked in!'
            : mode === 'reset' 
            ? 'Ticket successfully reset!'
            : 'Ticket details retrieved',
          details: data,
        }
        onScanResult(result)
      } else {
        onScanResult({
          ticketId,
          status: 'unredeemed',
          success: false,
          message: data.error || 'Failed to process ticket',
        })
      }
    } catch (error) {
      onScanResult({
        ticketId,
        status: 'unredeemed',
        success: false,
        message: 'Network error. Please try again.',
      })
    } finally {
      setIsProcessing(false)
      // Continue scanning after a short delay
      setTimeout(() => {
        if (scannerRef.current) {
          scannerRef.current.resume()
        }
      }, 2000)
    }
  }

  const getModeIcon = () => {
    switch (mode) {
      case 'check-in': return <CheckCircle className="w-5 h-5" />
      case 'view': return <Eye className="w-5 h-5" />
      case 'reset': return <RotateCcw className="w-5 h-5" />
    }
  }

  const getModeColor = () => {
    switch (mode) {
      case 'check-in': return 'from-green-600 to-emerald-600'
      case 'view': return 'from-blue-600 to-cyan-600'
      case 'reset': return 'from-orange-600 to-red-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="grid grid-cols-3 gap-3">
        {(['check-in', 'view', 'reset'] as ScanMode[]).map((m) => (
          <motion.button
            key={m}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setMode(m)}
            className={`p-4 rounded-xl font-semibold capitalize transition-all ${
              mode === m
                ? `bg-gradient-to-r ${getModeColor()} text-white shadow-lg`
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {m === 'check-in' && <CheckCircle className="w-5 h-5" />}
              {m === 'view' && <Eye className="w-5 h-5" />}
              {m === 'reset' && <RotateCcw className="w-5 h-5" />}
              {m.replace('-', ' ')}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Scan Type Selection */}
      <div className="flex gap-3 justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setScanType('qr')}
          className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
            scanType === 'qr'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <QrCode className="w-5 h-5" />
          QR Code
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setScanType('barcode')}
          className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
            scanType === 'barcode'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Barcode className="w-5 h-5" />
          Barcode
        </motion.button>
      </div>

      {/* Scanner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {!isScanning ? (
          <div className="p-12 text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsScanning(true)}
              className={`bg-gradient-to-r ${getModeColor()} text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg flex items-center gap-3 mx-auto`}
            >
              {getModeIcon()}
              Start Scanning
            </motion.button>
          </div>
        ) : (
          <div className="relative">
            <div id="scanner-container" ref={scannerElementRef} className="scanner-custom" />
            {isProcessing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-white rounded-xl p-4"
                >
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </motion.div>
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsScanning(false)}
              className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg"
            >
              Stop Scanning
            </motion.button>
          </div>
        )}
      </motion.div>

      <style jsx global>{`
        #scanner-container {
          position: relative;
          padding: 0;
          border: none;
        }
        #scanner-container video {
          width: 100% !important;
          height: auto !important;
          border-radius: 0;
        }
        #scanner-container button {
          display: none !important;
        }
      `}</style>
    </div>
  )
}