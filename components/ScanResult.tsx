'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Info, Clock, RotateCcw, X, BadgeCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ScanResultProps {
  result: {
    ticketId: string
    status: 'unredeemed' | 'redeemed'
    message: string
    success: boolean
    isBadge?: boolean
    details?: {
      // Ticket details
      createdAt?: string
      redeemedAt?: string
      resetAt?: string
      validDay?: 'day1' | 'day2' | 'day3' | 'day4' | 'day5'
      history?: { action: string; timestamp: string }[]
      // Badge details
      badgeId?: string
      name?: string
      department?: string
      type?: 'Badge' | 'Multiday Badge'
      days?: number[]
      checkInHistory?: { timestamp: string; day?: number }[]
      scanHistory?: { day: number; timestamps: string[] }[]
    }
  } | null
  onClose: () => void
}

export default function ScanResult({ result, onClose }: ScanResultProps) {
  if (!result) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <Dialog open={!!result} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 to-gray-900 border-white/20 w-full">
        <DialogHeader>
          <DialogTitle className="sr-only">Scan Result</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status Icon */}
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className={`flex h-20 w-20 items-center justify-center rounded-full ${
                result.success
                  ? 'bg-green-500/20 border border-green-500/30'
                  : 'bg-red-500/20 border border-red-500/30'
              }`}
            >
              {result.success ? (
                <CheckCircle className="h-12 w-12 text-green-400" />
              ) : (
                <XCircle className="h-12 w-12 text-red-400" />
              )}
            </motion.div>
          </div>

          {/* Message */}
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-white">
              {result.message}
            </h3>
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-white/60">{result.isBadge ? 'Badge ID:' : 'Ticket ID:'}</span>
              <Badge variant="outline" className="font-mono border-white/20 text-white">
                {result.ticketId}
              </Badge>
            </div>
            {result.isBadge && result.details?.name && (
              <div className="text-center mt-2">
                <p className="text-lg text-white">{result.details.name}</p>
                <p className="text-sm text-white/60">{result.details.department}</p>
              </div>
            )}
          </div>

          {/* Details */}
          {result.details && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  {result.isBadge ? 'Badge Details' : 'Ticket Details'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!result.isBadge && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Status:</span>
                    <Badge
                      variant={result.status === 'redeemed' ? 'default' : 'secondary'}
                      className={
                        result.status === 'redeemed'
                          ? 'bg-green-600/20 text-green-400 border-green-600/30'
                          : 'bg-blue-600/20 text-blue-400 border-blue-600/30'
                      }
                    >
                      {result.status === 'redeemed' ? (
                        <CheckCircle className="mr-1 h-3 w-3" />
                      ) : (
                        <Clock className="mr-1 h-3 w-3" />
                      )}
                      {result.status.toUpperCase()}
                    </Badge>
                  </div>
                )}
                
                {result.details.validDay && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Valid Day:</span>
                    <Badge
                      variant="outline"
                      className={
                        result.details.validDay === 'day1'
                          ? 'bg-purple-600/20 text-purple-400 border-purple-600/30'
                          : result.details.validDay === 'day2'
                          ? 'bg-blue-600/20 text-blue-400 border-blue-600/30'
                          : result.details.validDay === 'day3'
                          ? 'bg-orange-600/20 text-orange-400 border-orange-600/30'
                          : result.details.validDay === 'day4'
                          ? 'bg-green-600/20 text-green-400 border-green-600/30'
                          : 'bg-pink-600/20 text-pink-400 border-pink-600/30'
                      }
                    >
                      {result.details.validDay === 'day1' ? 'Day 1' : result.details.validDay === 'day2' ? 'Day 2' : result.details.validDay === 'day3' ? 'Day 3' : result.details.validDay === 'day4' ? 'Day 4' : 'Day 5'}
                    </Badge>
                  </div>
                )}
                
                {result.details.createdAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Created:</span>
                    <span className="text-sm text-white font-mono">
                      {formatDate(result.details.createdAt)}
                    </span>
                  </div>
                )}
                
                {result.details.redeemedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Redeemed:</span>
                    <span className="text-sm text-white font-mono">
                      {formatDate(result.details.redeemedAt)}
                    </span>
                  </div>
                )}
                
                {result.details.resetAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Last Reset:</span>
                    <span className="text-sm text-white font-mono">
                      {formatDate(result.details.resetAt)}
                    </span>
                  </div>
                )}

                {result.details.history && result.details.history.length > 0 && (
                  <div className="pt-3 border-t border-white/10">
                    <span className="text-sm text-white/60 mb-2 block">Recent Activity:</span>
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {result.details.history.slice(-3).reverse().map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <span className="text-white/50 capitalize">{entry.action}</span>
                          <span className="text-white/40 font-mono">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Badge-specific details */}
                {result.isBadge && result.details.name && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Name:</span>
                    <span className="text-sm text-white font-medium">
                      {result.details.name}
                    </span>
                  </div>
                )}
                
                {result.isBadge && result.details.department && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Department:</span>
                    <span className="text-sm text-white">
                      {result.details.department}
                    </span>
                  </div>
                )}
                
                {result.isBadge && result.details.type && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Badge Type:</span>
                    <Badge 
                      variant="outline"
                      className={result.details.type === 'Multiday Badge' ? 'bg-orange-600/20 text-orange-400 border-orange-600/30' : 'bg-blue-600/20 text-blue-400 border-blue-600/30'}
                    >
                      {result.details.type === 'Multiday Badge' ? 'Multiday' : 'Regular'}
                    </Badge>
                  </div>
                )}
                
                {result.isBadge && result.details.days && result.details.days.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Valid Days:</span>
                    <div className="flex gap-1">
                      {result.details.days.map((day: number) => (
                        <Badge 
                          key={day} 
                          variant="outline" 
                          className="text-xs bg-blue-600/20 text-blue-400 border-blue-600/30"
                        >
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {result.isBadge && result.details?.type === 'Multiday Badge' && result.details?.scanHistory && (
                  <div className="pt-3 border-t border-white/10">
                    <span className="text-sm text-white/60 mb-2 block">Day Scan Status:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {result.details?.days?.map((day: number) => {
                        const dayScans = result.details?.scanHistory?.find((scan: any) => scan.day === day)
                        const hasScanned = dayScans && dayScans.timestamps.length > 0
                        
                        return (
                          <div key={day} className="flex items-center justify-between text-xs">
                            <span className="text-white/60">Day {day}:</span>
                            <Badge 
                              variant="outline"
                              className={hasScanned ? 'bg-green-600/20 text-green-400 border-green-600/30' : 'bg-gray-600/20 text-gray-400 border-gray-600/30'}
                            >
                              {hasScanned ? `${dayScans.timestamps.length} scans` : 'Not scanned'}
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {result.isBadge && result.details.checkInHistory && result.details.checkInHistory.length > 0 && (
                  <div className="pt-3 border-t border-white/10">
                    <span className="text-sm text-white/60 mb-2 block">Check-in History ({result.details.checkInHistory.length} total):</span>
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {result.details.checkInHistory.slice(-5).reverse().map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-white/50">Check-in</span>
                            {result.details?.type === 'Multiday Badge' && entry.day && (
                              <Badge 
                                variant="outline" 
                                className="text-xs bg-blue-600/20 text-blue-400 border-blue-600/30"
                              >
                                Day {entry.day}
                              </Badge>
                            )}
                          </div>
                          <span className="text-white/40 font-mono">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Close Button */}
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            size="lg"
          >
            Continue Scanning
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}