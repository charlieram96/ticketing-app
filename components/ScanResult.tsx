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
      validDay?: 'day1' | 'day2' | 'day3'
      history?: { action: string; timestamp: string }[]
      // Badge details
      badgeId?: string
      name?: string
      department?: string
      checkInHistory?: { timestamp: string }[]
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
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 to-gray-900 border-white/20">
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
                          : 'bg-orange-600/20 text-orange-400 border-orange-600/30'
                      }
                    >
                      {result.details.validDay === 'day1' ? 'Day 1' : result.details.validDay === 'day2' ? 'Day 2' : 'Day 3'}
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

                {result.isBadge && result.details.checkInHistory && result.details.checkInHistory.length > 0 && (
                  <div className="pt-3 border-t border-white/10">
                    <span className="text-sm text-white/60 mb-2 block">Check-in History ({result.details.checkInHistory.length} total):</span>
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {result.details.checkInHistory.slice(-5).reverse().map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <span className="text-white/50">Check-in</span>
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