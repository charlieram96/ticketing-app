'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Info, Clock, RotateCcw, X } from 'lucide-react'
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
    details?: {
      createdAt?: string
      redeemedAt?: string
      resetAt?: string
      history?: { action: string; timestamp: string }[]
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
              <span className="text-sm text-white/60">Ticket ID:</span>
              <Badge variant="outline" className="font-mono border-white/20 text-white">
                {result.ticketId}
              </Badge>
            </div>
          </div>

          {/* Ticket Details */}
          {result.details && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Ticket Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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