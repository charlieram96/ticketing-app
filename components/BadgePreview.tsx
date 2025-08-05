'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, BadgeCheck, Clock, Calendar, Copy, Edit } from 'lucide-react'
import JsBarcode from 'jsbarcode'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface BadgePreviewProps {
  badge: {
    badgeId: string
    name: string
    department: string
    email: string
    phone?: string
    type: 'Badge' | 'Multiday Badge'
    days: number[]
    companion?: string
    checkInHistory: { timestamp: string; day?: number }[]
    scanHistory?: { day: number; timestamps: string[] }[]
  } | null
  onClose: () => void
  onEdit?: (badge: {
    badgeId: string
    name: string
    department: string
    email: string
    phone?: string
    type: 'Badge' | 'Multiday Badge'
    days: number[]
    companion?: string
  }) => void
}

export default function BadgePreview({ badge, onClose, onEdit }: BadgePreviewProps) {
  const Barcode = ({ value }: { value: string }) => {
    const svgRef = useRef<SVGSVGElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (svgRef.current && containerRef.current) {
        // Generate barcode using SVG
        JsBarcode(svgRef.current, value, {
          format: 'CODE128',
          width: 10,
          height: 140,
          displayValue: false, // No text from jsbarcode
          background: '#ffffff',
          lineColor: '#000000',
          margin: 10,
          flat: false
        })
      }
    }, [value])

    return (
      <div ref={containerRef} style={{ 
        width: '400px',
        height: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative'
      }}>
        <svg ref={svgRef} />
        {/* Custom text overlay positioned in bottom right of barcode */}
        <div 
          style={{
            position: 'absolute',
            bottom: '21px',
            right: '0px',
            backgroundColor: 'white',
            padding: '0px 2px 2px 5px',
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            color: 'black',
            zIndex: 10
          }}
        >
          {value}
        </div>
      </div>
    )
  }

  if (!badge) return null

  const copyBarcodeAsImage = async () => {
    try {
      // Create a canvas to composite the barcode with text
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      
      // Set canvas size
      canvas.width = 1250
      canvas.height = 136
      
      // Fill white background
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Generate barcode on temporary canvas
      const tempCanvas = document.createElement('canvas')
      JsBarcode(tempCanvas, badge.badgeId, {
        format: 'CODE128',
        width: 10,
        height: 360,
        displayValue: false,
        background: '#ffffff',
        lineColor: '#000000',
        margin: 10,
        flat: false
      })
      
      // Draw barcode onto main canvas
      ctx.drawImage(tempCanvas, 0, 0)
      
      // Add text overlay
      ctx.fillStyle = 'white'
      ctx.font = 'bold 36px Arial'
      const text = badge.badgeId
      const textMetrics = ctx.measureText(text)
      const textWidth = textMetrics.width
      
      // Position in bottom right
      const x = canvas.width - textWidth - 5
      const y = canvas.height
      
      // Draw white background for text
      ctx.fillRect(x - 10, y - 36, textWidth + 20, 36)
      
      // Draw black text
      ctx.fillStyle = 'black'
      ctx.fillText(text, x, y)
      
      // Convert to blob and copy to clipboard
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ])
            // Could add success feedback here
          } catch (error) {
            console.error('Failed to copy image:', error)
            // Fallback: download the image
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `barcode-${badge.badgeId}.png`
            a.click()
            URL.revokeObjectURL(url)
          }
        }
      }, 'image/png')
    } catch (error) {
      console.error('Failed to generate barcode image:', error)
    }
  }


  const getCheckInsByDate = () => {
    const checkInsByDate: { [key: string]: { count: number; days: number[] } } = {}
    badge.checkInHistory.forEach(checkIn => {
      const date = new Date(checkIn.timestamp).toDateString()
      if (!checkInsByDate[date]) {
        checkInsByDate[date] = { count: 0, days: [] }
      }
      checkInsByDate[date].count += 1
      if (checkIn.day && !checkInsByDate[date].days.includes(checkIn.day)) {
        checkInsByDate[date].days.push(checkIn.day)
      }
    })
    return Object.entries(checkInsByDate).sort((a, b) => 
      new Date(b[0]).getTime() - new Date(a[0]).getTime()
    )
  }

  const checkInsByDate = getCheckInsByDate()

  return (
    <Dialog open={!!badge} onOpenChange={() => onClose()}>
      <DialogContent className="w-[max(85vw, 800px)] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900 flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-purple-600" />
              Badge Details
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Badge Info */}
          <Card className="bg-gray-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-900">{badge.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Badge ID:</span>
                <Badge variant="outline" className="font-mono bg-white">
                  {badge.badgeId}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Department:</span>
                <Badge className="bg-purple-100 text-purple-700">
                  {badge.department}
                </Badge>
              </div>
              {badge.companion && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Acompañante:</span>
                  <Badge className="bg-green-100 text-green-700">
                    {badge.companion}
                  </Badge>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Badge Type:</span>
                <Badge 
                  className={badge.type === 'Multiday Badge' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}
                >
                  {badge.type === 'Multiday Badge' ? 'Multiday' : 'Regular'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Valid Days:</span>
                <div className="flex gap-1">
                  {badge.days.map(day => (
                    <Badge 
                      key={day} 
                      variant="outline" 
                      className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                    >
                      Day {day}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Check-ins:</span>
                <Badge className="bg-blue-100 text-blue-700">
                  {badge.checkInHistory.length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Barcode */}
          <Card className="bg-gray-50/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Barcode value={badge.badgeId} />
                <Button
                  onClick={copyBarcodeAsImage}
                  variant="outline"
                  size="sm"
                  className="ml-4 text-gray-700 hover:bg-gray-100"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Image
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Check-in History */}
          {badge.checkInHistory.length > 0 && (
            <Card className="bg-gray-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Check-in History
                  {badge.type === 'Multiday Badge' && (
                    <Badge variant="outline" className="ml-2 text-xs bg-orange-50 text-orange-700 border-orange-200">
                      Multiday Badge
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {checkInsByDate.map(([date, info]) => (
                    <div key={date} className="border-b border-gray-200 pb-2 last:border-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900">{date}</span>
                          {badge.type === 'Multiday Badge' && info.days.length > 0 && (
                            <div className="flex gap-1">
                              {info.days.map(day => (
                                <Badge 
                                  key={day} 
                                  variant="outline" 
                                  className="text-xs bg-green-50 text-green-700 border-green-200"
                                >
                                  Day {day}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {info.count} check-in{info.count > 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="pl-6 space-y-1">
                        {badge.checkInHistory
                          .filter(checkIn => new Date(checkIn.timestamp).toDateString() === date)
                          .map((checkIn, index) => (
                            <div key={index} className="text-xs text-gray-600 flex items-center gap-2">
                              <span>{new Date(checkIn.timestamp).toLocaleTimeString()}</span>
                              {badge.type === 'Multiday Badge' && checkIn.day && (
                                <Badge 
                                  variant="outline" 
                                  className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                >
                                  Day {checkIn.day}
                                </Badge>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Multiday Badge Status */}
          {badge.type === 'Multiday Badge' && badge.scanHistory && (
            <Card className="bg-gray-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5" />
                  Day-by-Day Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {badge.days.map(day => {
                    const dayScans = badge.scanHistory?.find(scan => scan.day === day)
                    const hasScanned = dayScans && dayScans.timestamps.length > 0
                    
                    return (
                      <div key={day} className="text-center">
                        <div className={`p-3 rounded-lg border-2 ${
                          hasScanned 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-gray-200 bg-gray-50'
                        }`}>
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            Day {day}
                          </div>
                          <Badge 
                            variant={hasScanned ? 'default' : 'outline'}
                            className={hasScanned ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                          >
                            {hasScanned ? `${dayScans.timestamps.length} scans` : 'Not scanned'}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {onEdit && (
              <Button
                onClick={() => {
                  onEdit({
                    badgeId: badge.badgeId,
                    name: badge.name,
                    department: badge.department,
                    email: badge.email,
                    phone: badge.phone,
                    type: badge.type,
                    days: badge.days,
                    companion: badge.companion
                  })
                  onClose()
                }}
                variant="default"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Badge
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="outline"
              className={`${onEdit ? 'flex-1' : 'w-full'} text-gray-700 hover:bg-gray-50`}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}