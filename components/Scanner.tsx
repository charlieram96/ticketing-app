'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode'
import { motion } from 'framer-motion'
import { Barcode, CheckCircle, Eye, RotateCcw, Loader2, Play, Square, SwitchCamera, BadgeCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type ScanMode = 'check-in' | 'view' | 'reset' | 'badge'

interface ScanResult {
  ticketId: string
  status: 'unredeemed' | 'redeemed'
  message: string
  success: boolean
  details?: any
  isBadge?: boolean
}

interface ScannerProps {
  onScanResult: (result: ScanResult | null) => void
}

export default function Scanner({ onScanResult }: ScannerProps) {
  const [mode, setMode] = useState<ScanMode>('check-in')
  const [isScanning, setIsScanning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [scannerError, setScannerError] = useState<string | null>(null)
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false)
  const [selectedDay, setSelectedDay] = useState<'day1' | 'day2' | 'day3' | 'day4'>('day1')
  // Default to back camera on mobile, front camera on desktop
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'environment' : 'user'
  )
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const scannerElementRef = useRef<HTMLDivElement>(null)
  const isProcessingRef = useRef(false)

  // Clear any previous scan result when selectedDay changes
  useEffect(() => {
    if (mode === 'check-in') {
      onScanResult(null)
    }
  }, [selectedDay, mode, onScanResult])

  useEffect(() => {
    if (isScanning && scannerElementRef.current) {
      console.log('Starting scanner with facingMode:', facingMode)
      setScannerError(null) // Clear any previous errors
      
      const config = {
        fps: 10,
        qrbox: { width: 320, height: 160 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        aspectRatio: 1.0,
        showTorchButtonIfSupported: false,
        showZoomSliderIfSupported: false,
        defaultZoomValueIfSupported: 1,
        useBarCodeDetectorIfSupported: true,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        },
        // Simplified camera constraints
        videoConstraints: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        rememberLastUsedCamera: true
      }

      try {
        scannerRef.current = new Html5QrcodeScanner('scanner-container', config, false)
        
        scannerRef.current.render(
          async (decodedText) => {
            console.log('Barcode detected:', decodedText)
            if (!isProcessingRef.current) {
              await handleScan(decodedText)
            }
          },
          (error) => {
            // Only log meaningful errors, not continuous scan failures
            if (!error.includes('NotFoundException') && 
                !error.includes('No MultiFormat Readers') && 
                !error.includes('No barcode or QR code detected') &&
                !error.includes('QR code parse error')) {
              console.error('Scanner error:', error)
            }
          }
        )
      } catch (error) {
        console.error('Failed to initialize scanner:', error)
        let errorMessage = 'Failed to start camera'
        
        if (error && typeof error === 'object' && 'name' in error) {
          if (error.name === 'NotAllowedError') {
            errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.'
          } else if (error.name === 'NotFoundError') {
            errorMessage = 'No camera found on this device.'
          } else if (error.name === 'NotSupportedError') {
            errorMessage = 'Camera not supported on this device/browser.'
          } else if (error.name === 'NotReadableError') {
            errorMessage = 'Camera is already in use by another application.'
          }
        }
        
        setScannerError(errorMessage)
        setIsScanning(false)
      }
    }

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear()
        } catch (error) {
          console.error('Error clearing scanner:', error)
        }
        scannerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScanning, mode, facingMode])

  const handleScan = async (scannedId: string) => {
    // Prevent multiple simultaneous scans
    if (isProcessingRef.current) {
      console.log('Already processing a scan, ignoring...')
      return
    }
    
    isProcessingRef.current = true
    
    // Immediately pause the scanner to prevent multiple scans
    if (scannerRef.current) {
      try {
        scannerRef.current.pause()
      } catch (error) {
        console.log('Scanner pause error:', error)
      }
    }
    
    setIsProcessing(true)
    
    try {
      if (mode === 'badge') {
        // Handle badge scanning
        const action = 'check-in'
        const response = await fetch(`/api/badges/${scannedId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        })

        const data = await response.json()

        if (response.ok) {
          const result: ScanResult = {
            ticketId: scannedId,
            status: 'unredeemed', // badges don't have status
            success: true,
            message: 'Badge successfully checked in!',
            details: data,
            isBadge: true,
          }
          onScanResult(result)
          
          // For successful operations, wait longer before resuming
          setTimeout(() => {
            if (scannerRef.current) {
              try {
                scannerRef.current.resume()
              } catch (error) {
                console.log('Scanner resume error:', error)
              }
            }
          }, 3000)
        } else {
          onScanResult({
            ticketId: scannedId,
            status: 'unredeemed',
            success: false,
            message: data.error || 'Failed to process badge',
            isBadge: true,
          })
          
          // For errors, resume after a shorter delay
          setTimeout(() => {
            if (scannerRef.current) {
              try {
                scannerRef.current.resume()
              } catch (error) {
                console.log('Scanner resume error:', error)
              }
            }
          }, 2000)
        }
      } else {
        // Handle ticket scanning
        const action = mode === 'check-in' ? 'redeem' : mode === 'reset' ? 'reset' : 'view'
        
        const requestBody: any = { action }
        if (action === 'redeem') {
          requestBody.selectedDay = selectedDay
        }
        
        const response = await fetch(`/api/tickets/${scannedId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        })

        const data = await response.json()

        if (response.ok) {
          const result: ScanResult = {
            ticketId: scannedId,
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
          
          // For successful operations, wait longer before resuming
          setTimeout(() => {
            if (scannerRef.current) {
              try {
                scannerRef.current.resume()
              } catch (error) {
                console.log('Scanner resume error:', error)
              }
            }
          }, mode === 'check-in' || mode === 'reset' ? 4000 : 3000)
        } else {
          onScanResult({
            ticketId: scannedId,
            status: 'unredeemed',
            success: false,
            message: data.error || 'Failed to process ticket',
          })
          
          // For errors, resume after a shorter delay
          setTimeout(() => {
            if (scannerRef.current) {
              try {
                scannerRef.current.resume()
              } catch (error) {
                console.log('Scanner resume error:', error)
              }
            }
          }, 2000)
        }
      }
    } catch (error) {
      onScanResult({
        ticketId: scannedId,
        status: 'unredeemed',
        success: false,
        message: 'Network error. Please try again.',
        isBadge: mode === 'badge',
      })
      
      // Resume after network errors
      setTimeout(() => {
        if (scannerRef.current) {
          try {
            scannerRef.current.resume()
          } catch (error) {
            console.log('Scanner resume error:', error)
          }
        }
      }, 2000)
    } finally {
      setIsProcessing(false)
      isProcessingRef.current = false
    }
  }

  const switchCamera = async () => {
    console.log('Switching camera from', facingMode, 'to', facingMode === 'user' ? 'environment' : 'user')
    
    setIsSwitchingCamera(true)
    
    // Stop current scanner
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear()
        scannerRef.current = null
      } catch (error) {
        console.error('Error clearing scanner:', error)
      }
    }
    
    // Clear any previous errors
    setScannerError(null)
    
    // Switch camera mode
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(newFacingMode)
    
    // Reset switching state after a brief delay
    setTimeout(() => {
      setIsSwitchingCamera(false)
      console.log('Camera switch complete, new mode:', newFacingMode)
    }, 500)
  }

  const getModeConfig = (m: ScanMode) => {
    switch (m) {
      case 'check-in':
        return { 
          icon: CheckCircle, 
          color: 'bg-green-600 hover:bg-green-700 text-white',
          bgColor: 'bg-green-50',
          textColor: 'text-green-600'
        }
      case 'view':
        return { 
          icon: Eye, 
          color: 'bg-blue-600 hover:bg-blue-700 text-white',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-600'
        }
      case 'reset':
        return { 
          icon: RotateCcw, 
          color: 'bg-orange-600 hover:bg-orange-700 text-white',
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-600'
        }
      case 'badge':
        return { 
          icon: BadgeCheck, 
          color: 'bg-purple-600 hover:bg-purple-700 text-white',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-600'
        }
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Mode Selection */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        {(['check-in', 'view', 'reset', 'badge'] as ScanMode[]).map((m) => {
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
                    ? config.color
                    : `bg-gray-50/50 ${config.textColor} hover:${config.bgColor}`
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span className="font-medium">{m === 'check-in' ? 'Check-in' : m === 'view' ? 'View' : m === 'reset' ? 'Reset' : 'Badge'}</span>
              </Button>
            </motion.div>
          )
        })}
      </div>

      {/* Day Selection for Check-in Mode */}
      {mode === 'check-in' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Event Day</label>
          <div className="grid grid-cols-4 gap-2">
            {(['day1', 'day2', 'day3', 'day4'] as const).map((day) => (
              <motion.div key={day} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => setSelectedDay(day)}
                  variant={selectedDay === day ? "default" : "outline"}
                  className={`h-10 w-full ${
                    selectedDay === day 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {day === 'day1' ? 'Day 1' : day === 'day2' ? 'Day 2' : day === 'day3' ? 'Day 3' : 'Day 4'}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Scanner Interface */}
      <ScannerInterface 
        isScanning={isScanning}
        isProcessing={isProcessing}
        isSwitchingCamera={isSwitchingCamera}
        mode={mode}
        facingMode={facingMode}
        scannerError={scannerError}
        onStartScan={() => setIsScanning(true)}
        onStopScan={() => setIsScanning(false)}
        onSwitchCamera={switchCamera}
        onClearError={() => {
          setScannerError(null)
          setIsScanning(false)
        }}
        scannerElementRef={scannerElementRef}
      />
    </div>
  )
}

interface ScannerInterfaceProps {
  isScanning: boolean
  isProcessing: boolean
  isSwitchingCamera: boolean
  mode: ScanMode
  facingMode: 'user' | 'environment'
  scannerError: string | null
  onStartScan: () => void
  onStopScan: () => void
  onSwitchCamera: () => void
  onClearError: () => void
  scannerElementRef: React.RefObject<HTMLDivElement | null>
}

function ScannerInterface({ 
  isScanning, 
  isProcessing, 
  isSwitchingCamera,
  mode, 
  facingMode,
  scannerError,
  onStartScan, 
  onStopScan, 
  onSwitchCamera,
  onClearError,
  scannerElementRef 
}: ScannerInterfaceProps) {
  const config = {
    'check-in': { color: 'bg-green-600 text-white', icon: CheckCircle },
    'view': { color: 'bg-blue-600 text-white', icon: Eye },
    'reset': { color: 'bg-orange-600 text-white', icon: RotateCcw },
    'badge': { color: 'bg-purple-600 text-white', icon: BadgeCheck }
  }[mode]

  const IconComponent = config.icon

  return (
    <Card className="bg-gray-50/50 overflow-hidden">
      {!isScanning ? (
        <CardContent className="p-6 sm:p-12 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className={`mx-auto h-16 w-16 sm:h-20 sm:w-20 rounded-full ${config.color} flex items-center justify-center`}>
              <IconComponent className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                {mode === 'check-in' ? 'Check-in Mode' : mode === 'view' ? 'View Mode' : mode === 'reset' ? 'Reset Mode' : 'Badge Mode'}
              </h3>
              <p className="text-sm text-gray-600">
                Camera: {facingMode === 'user' ? 'Front' : 'Back'} Camera
              </p>
            </div>

            <div className="space-y-3 w-full px-4">
              <Button
                onClick={() => {
                  console.log('Start scanning clicked, current facingMode:', facingMode)
                  onStartScan()
                }}
                size="lg"
                className={`${config.color} hover:opacity-80 transition-opacity w-full h-14 text-base`}
              >
                <Play className="mr-2 h-5 w-5" />
                Start Scanning
              </Button>
              
              <Button
                onClick={onSwitchCamera}
                variant="outline"
                size="lg"
                className="w-full min-h-[48px] touch-manipulation"
              >
                <SwitchCamera className="mr-2 h-5 w-5" />
                Switch to {facingMode === 'user' ? 'Back' : 'Front'} Camera
              </Button>
            </div>
          </motion.div>
        </CardContent>
      ) : (
        <div className="relative min-h-[400px] bg-gray-50">
          <div 
            id="scanner-container" 
            ref={scannerElementRef} 
            className="scanner-custom w-full h-full min-h-[400px]"
            style={{ minHeight: '400px' }}
          />
          
          {scannerError && (
            <div className="absolute inset-0 bg-red-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm text-center">
                <div className="text-red-600 text-sm mb-2">Camera Error</div>
                <div className="text-gray-700 text-xs mb-3">{scannerError}</div>
                {scannerError.includes('permission') && (
                  <div className="text-xs text-gray-600 mb-3 p-2 bg-blue-50 rounded">
                    <strong>Safari users:</strong> Go to Settings → Safari → Camera and select "Allow". 
                    For desktop Safari, click the camera icon in the address bar.
                  </div>
                )}
                <Button 
                  onClick={onClearError}
                  size="sm"
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
          
          {(isProcessing || isSwitchingCamera) && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm z-50">
              <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-4 flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-gray-900 text-sm">
                  {isSwitchingCamera ? 'Switching camera...' : 'Processing...'}
                </span>
              </div>
            </div>
          )}
          
          {/* Clean Bottom Controls */}
          <div className="absolute inset-x-0 bottom-0 bg-white p-4 z-40">
            <div className="flex items-center justify-between max-w-md mx-auto gap-3">
              <Button
                onClick={onSwitchCamera}
                disabled={isSwitchingCamera}
                variant="outline"
                size="lg"
                className="flex items-center gap-2 text-gray-700 hover:bg-gray-50 min-h-[48px] px-4 touch-manipulation disabled:opacity-50"
              >
                {isSwitchingCamera ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <SwitchCamera className="h-5 w-5" />
                )}
                <span className="text-sm font-medium">
                  {isSwitchingCamera ? 'Switching...' : facingMode === 'user' ? 'Back' : 'Front'}
                </span>
              </Button>
              
              <div className="text-center flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {mode === 'check-in' ? 'Check-in' : mode === 'view' ? 'View' : mode === 'reset' ? 'Reset' : 'Badge'}
                </div>
                <div className="text-xs text-gray-500">
                  {facingMode === 'user' ? 'Front Camera' : 'Back Camera'}
                </div>
              </div>
              
              <Button
                onClick={onStopScan}
                variant="destructive"
                size="lg"
                className="flex items-center gap-2 min-h-[48px] px-4 bg-red-600 hover:bg-red-700 text-white shadow-md touch-manipulation"
              >
                <Square className="h-5 w-5" />
                <span className="text-sm font-medium">Stop</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}