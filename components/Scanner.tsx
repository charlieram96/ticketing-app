'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, Barcode, CheckCircle, XCircle, Eye, RotateCcw, Loader2, Play, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
      setTimeout(() => {
        if (scannerRef.current) {
          scannerRef.current.resume()
        }
      }, 2000)
    }
  }

  const getModeConfig = (m: ScanMode) => {
    switch (m) {
      case 'check-in':
        return { 
          icon: CheckCircle, 
          color: 'bg-green-600 hover:bg-green-700',
          bgColor: 'border-green-500/20 bg-green-500/10',
          textColor: 'text-green-400'
        }
      case 'view':
        return { 
          icon: Eye, 
          color: 'bg-blue-600 hover:bg-blue-700',
          bgColor: 'border-blue-500/20 bg-blue-500/10',
          textColor: 'text-blue-400'
        }
      case 'reset':
        return { 
          icon: RotateCcw, 
          color: 'bg-orange-600 hover:bg-orange-700',
          bgColor: 'border-orange-500/20 bg-orange-500/10',
          textColor: 'text-orange-400'
        }
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Mode Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(['check-in', 'view', 'reset'] as ScanMode[]).map((m) => {
          const config = getModeConfig(m)
          const IconComponent = config.icon
          const isActive = mode === m
          
          return (
            <motion.div key={m} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => setMode(m)}
                variant={isActive ? "default" : "outline"}
                className={`h-auto w-full flex-row sm:flex-col gap-3 sm:gap-2 p-4 justify-start sm:justify-center text-left sm:text-center ${
                  isActive 
                    ? `${config.color} text-white` 
                    : `${config.bgColor} ${config.textColor} hover:${config.bgColor.replace('/10', '/20')}`
                }`}
              >
                <IconComponent className="h-5 w-5" />
                <span className="capitalize font-semibold">{m.replace('-', ' ')}</span>
              </Button>
            </motion.div>
          )
        })}
      </div>

      {/* Scan Type Tabs */}
      <Tabs value={scanType} onValueChange={(value) => setScanType(value as ScanType)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100">
          <TabsTrigger value="qr" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <QrCode className="mr-2 h-4 w-4" />
            QR Code
          </TabsTrigger>
          <TabsTrigger value="barcode" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Barcode className="mr-2 h-4 w-4" />
            Barcode
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="qr" className="mt-4 sm:mt-6">
          <ScannerInterface 
            isScanning={isScanning}
            isProcessing={isProcessing}
            mode={mode}
            onStartScan={() => setIsScanning(true)}
            onStopScan={() => setIsScanning(false)}
            scannerElementRef={scannerElementRef}
          />
        </TabsContent>
        
        <TabsContent value="barcode" className="mt-4 sm:mt-6">
          <ScannerInterface 
            isScanning={isScanning}
            isProcessing={isProcessing}
            mode={mode}
            onStartScan={() => setIsScanning(true)}
            onStopScan={() => setIsScanning(false)}
            scannerElementRef={scannerElementRef}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface ScannerInterfaceProps {
  isScanning: boolean
  isProcessing: boolean
  mode: ScanMode
  onStartScan: () => void
  onStopScan: () => void
  scannerElementRef: React.RefObject<HTMLDivElement | null>
}

function ScannerInterface({ 
  isScanning, 
  isProcessing, 
  mode, 
  onStartScan, 
  onStopScan, 
  scannerElementRef 
}: ScannerInterfaceProps) {
  const config = {
    'check-in': { color: 'from-green-600 to-emerald-600', icon: CheckCircle },
    'view': { color: 'from-blue-600 to-cyan-600', icon: Eye },
    'reset': { color: 'from-orange-600 to-red-600', icon: RotateCcw }
  }[mode]

  const IconComponent = config.icon

  return (
    <Card className="border-gray-200 bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg">
      {!isScanning ? (
        <CardContent className="p-6 sm:p-12 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className={`mx-auto h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center`}>
              <IconComponent className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                Ready to scan in {mode.replace('-', ' ')} mode
              </h3>
              <p className="text-sm text-gray-600 px-4">
                Click the button below to start scanning tickets
              </p>
            </div>

            <Button
              onClick={onStartScan}
              size="lg"
              className={`bg-gradient-to-r ${config.color} hover:opacity-90 transition-opacity w-full sm:w-auto`}
            >
              <Play className="mr-2 h-5 w-5" />
              Start Scanning
            </Button>
          </motion.div>
        </CardContent>
      ) : (
        <div className="relative">
          <div id="scanner-container" ref={scannerElementRef} className="scanner-custom" />
          
          {isProcessing && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm">
              <Card className="bg-white backdrop-blur-md border-gray-200 shadow-lg">
                <CardContent className="p-6 flex items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="text-gray-900 font-medium">Processing ticket...</span>
                </CardContent>
              </Card>
            </div>
          )}
          
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
            <Button
              onClick={onStopScan}
              variant="destructive"
              size="sm"
              className="bg-red-600 hover:bg-red-700 backdrop-blur-sm text-xs sm:text-sm"
            >
              <Square className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Stop Scanning</span>
            </Button>
          </div>

          <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4">
            <Badge variant="secondary" className="bg-white/90 text-gray-900 backdrop-blur-sm border-gray-200 text-xs sm:text-sm">
              <IconComponent className="mr-1 h-3 w-3" />
              <span className="hidden sm:inline">{mode.replace('-', ' ')} mode</span>
              <span className="sm:hidden">{mode.charAt(0).toUpperCase()}</span>
            </Badge>
          </div>
        </div>
      )}
    </Card>
  )
}