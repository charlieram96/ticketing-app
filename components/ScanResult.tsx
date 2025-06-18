'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Info, Clock, RotateCcw } from 'lucide-react'

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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          exit={{ y: 50 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className={`w-20 h-20 rounded-full flex items-center justify-center ${
                result.success
                  ? 'bg-green-100'
                  : 'bg-red-100'
              }`}
            >
              {result.success ? (
                <CheckCircle className="w-12 h-12 text-green-600" />
              ) : (
                <XCircle className="w-12 h-12 text-red-600" />
              )}
            </motion.div>
          </div>

          {/* Message */}
          <h3 className="text-2xl font-bold text-center mb-2">
            {result.message}
          </h3>
          <p className="text-gray-600 text-center mb-6">
            Ticket ID: <span className="font-mono font-semibold">{result.ticketId}</span>
          </p>

          {/* Ticket Details */}
          {result.details && (
            <div className="space-y-3 mb-6 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm">
                <Info className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Status:</span>
                <span className={`font-semibold ${
                  result.status === 'redeemed' ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {result.status.toUpperCase()}
                </span>
              </div>
              
              {result.details.createdAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Created:</span>
                  <span className="text-gray-800">{formatDate(result.details.createdAt)}</span>
                </div>
              )}
              
              {result.details.redeemedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Redeemed:</span>
                  <span className="text-gray-800">{formatDate(result.details.redeemedAt)}</span>
                </div>
              )}
              
              {result.details.resetAt && (
                <div className="flex items-center gap-2 text-sm">
                  <RotateCcw className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Last Reset:</span>
                  <span className="text-gray-800">{formatDate(result.details.resetAt)}</span>
                </div>
              )}
            </div>
          )}

          {/* Close Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold"
          >
            Continue Scanning
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}