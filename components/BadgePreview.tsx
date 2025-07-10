'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, BadgeCheck, Clock, Calendar } from 'lucide-react'
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
    checkInHistory: { timestamp: string }[]
  } | null
  onClose: () => void
}

export default function BadgePreview({ badge, onClose }: BadgePreviewProps) {
  const Barcode = ({ value }: { value: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
      if (canvasRef.current) {
        JsBarcode(canvasRef.current, value, {
          format: 'CODE128',
          width: 10,
          height: 140,
          displayValue: false,
          fontSize: 2,
          background: '#ffffff',
          lineColor: '#000000',
          margin: 10,
          textMargin: 5,
        })
      }
    }, [value])

    return <canvas ref={canvasRef} style={{ width: '400px', height: '100px' }} />
  }

  if (!badge) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getCheckInsByDate = () => {
    const checkInsByDate: { [key: string]: number } = {}
    badge.checkInHistory.forEach(checkIn => {
      const date = new Date(checkIn.timestamp).toDateString()
      checkInsByDate[date] = (checkInsByDate[date] || 0) + 1
    })
    return Object.entries(checkInsByDate).sort((a, b) => 
      new Date(b[0]).getTime() - new Date(a[0]).getTime()
    )
  }

  const checkInsByDate = getCheckInsByDate()

  return (
    <Dialog open={!!badge} onOpenChange={() => onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-lg bg-white max-h-[90vh] overflow-y-auto">
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
            <CardContent className="p-6 flex justify-start">
              <Barcode value={badge.badgeId} />
            </CardContent>
          </Card>

          {/* Check-in History */}
          {badge.checkInHistory.length > 0 && (
            <Card className="bg-gray-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Check-in History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {checkInsByDate.map(([date, count]) => (
                    <div key={date} className="border-b border-gray-200 pb-2 last:border-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900">{date}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {count} check-in{count > 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="pl-6 space-y-1">
                        {badge.checkInHistory
                          .filter(checkIn => new Date(checkIn.timestamp).toDateString() === date)
                          .map((checkIn, index) => (
                            <div key={index} className="text-xs text-gray-600">
                              {new Date(checkIn.timestamp).toLocaleTimeString()}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full text-gray-700 hover:bg-gray-50"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}