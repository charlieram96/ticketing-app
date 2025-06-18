'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode'
import { motion } from 'framer-motion'
import { QrCode, Barcode, CheckCircle, Eye, RotateCcw, Loader2, Play, Square, SwitchCamera } from 'lucide-react'
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
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const scannerElementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isScanning && scannerElementRef.current) {
      const config = {
        fps: 10,
        qrbox: scanType === 'qr' ? { width: 280, height: 280 } : { width: 320, height: 160 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: false, // Disable to clean up mobile UI
        defaultZoomValueIfSupported: 1,
        useBarCodeDetectorIfSupported: true,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        },
        // Optimized camera constraints for mobile
        videoConstraints: {
          facingMode: facingMode === 'user' ? 'user' : 'environment',
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 15 }
        },
        // Better mobile performance
        rememberLastUsedCamera: true
      }

      scannerRef.current = new Html5QrcodeScanner('scanner-container', config, false)
      
      scannerRef.current.render(
        async (decodedText) => {
          if (!isProcessing) {
            await handleScan(decodedText)
          }
        },
        (error) => {
          // Only log meaningful errors, not continuous scan failures
          if (!error.includes('NotFoundException')) {
            console.log('Scan error:', error)
          }
        }
      )
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear()
        scannerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScanning, scanType, mode, facingMode])

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

  const switchCamera = () => {
    if (scannerRef.current) {
      scannerRef.current.clear()
    }
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
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
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        {(['check-in', 'view', 'reset'] as ScanMode[]).map((m) => {
          const config = getModeConfig(m)
          const IconComponent = config.icon
          const isActive = mode === m
          
          return (
            <motion.div key={m} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button
                onClick={() => setMode(m)}
                variant={isActive ? "default" : "outline"}
                className={`h-12 w-full flex items-center justify-center gap-2 ${
                  isActive 
                    ? `${config.color} text-white` 
                    : `bg-white ${config.textColor} border-gray-200 hover:bg-gray-50`
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span className="font-medium">{m === 'check-in' ? 'Check-in' : m === 'view' ? 'View' : 'Reset'}</span>
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
            scanType={scanType}
            facingMode={facingMode}
            onStartScan={() => setIsScanning(true)}
            onStopScan={() => setIsScanning(false)}
            onSwitchCamera={switchCamera}
            scannerElementRef={scannerElementRef}
          />
        </TabsContent>
        
        <TabsContent value="barcode" className="mt-4 sm:mt-6">
          <ScannerInterface 
            isScanning={isScanning}
            isProcessing={isProcessing}
            mode={mode}
            scanType={scanType}
            facingMode={facingMode}
            onStartScan={() => setIsScanning(true)}
            onStopScan={() => setIsScanning(false)}
            onSwitchCamera={switchCamera}
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
  scanType: ScanType
  facingMode: 'user' | 'environment'
  onStartScan: () => void
  onStopScan: () => void
  onSwitchCamera: () => void
  scannerElementRef: React.RefObject<HTMLDivElement | null>
}

function ScannerInterface({ 
  isScanning, 
  isProcessing, 
  mode, 
  scanType,
  facingMode,
  onStartScan, 
  onStopScan, 
  onSwitchCamera,
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
                {mode === 'check-in' ? 'Check-in Mode' : mode === 'view' ? 'View Mode' : 'Reset Mode'}
              </h3>
              <p className="text-sm text-gray-600">
                Camera: {facingMode === 'user' ? 'Front' : 'Back'}
              </p>
            </div>

            <div className="space-y-3 w-full px-4">
              <Button
                onClick={onStartScan}
                size="lg"
                className={`bg-gradient-to-r ${config.color} hover:opacity-90 transition-opacity w-full h-14 text-base`}
              >
                <Play className="mr-2 h-5 w-5" />
                Start Scanning
              </Button>
              
              <Button
                onClick={onSwitchCamera}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <SwitchCamera className="mr-2 h-4 w-4" />
                Switch to {facingMode === 'user' ? 'Back' : 'Front'} Camera
              </Button>
            </div>
          </motion.div>
        </CardContent>
      ) : (
        <div className="relative">
          <div id="scanner-container" ref={scannerElementRef} className="scanner-custom" />
          
          {isProcessing && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-4 flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-gray-900 text-sm">Processing...</span>
              </div>
            </div>
          )}
          
          {/* Simplified Controls Overlay */}
          <div className="absolute inset-x-0 bottom-4 px-4">
            <div className="bg-black/50 backdrop-blur-md rounded-lg p-3">
              <div className="flex items-center justify-between">
                <Button
                  onClick={onSwitchCamera}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <SwitchCamera className="h-5 w-5" />
                </Button>
                
                <span className="text-white text-sm font-medium">
                  {mode === 'check-in' ? 'Check-in' : mode === 'view' ? 'View' : 'Reset'}
                </span>
                
                <Button
                  onClick={onStopScan}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <Square className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}