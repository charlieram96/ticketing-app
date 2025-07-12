'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, Download, FileSpreadsheet } from 'lucide-react'
import QRCode from 'react-qr-code'
import JsBarcode from 'jsbarcode'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Image from 'next/image'
import { generateTicketsPDF } from '@/components/TicketsPDF'

interface TicketPreviewProps {
  ticket: {
    id: string
    status: 'unredeemed' | 'redeemed'
    createdAt: string
    redeemedAt?: string
    resetAt?: string
    validDay: 'day1' | 'day2' | 'day3' | 'day4'
  } | null
  onClose: () => void
}

export default function TicketPreview({ ticket, onClose }: TicketPreviewProps) {
  const handleGeneratePDF = async () => {
    if (ticket) {
      await generateTicketsPDF([ticket.id], ticket.validDay)
    }
  }

  const handleDownload = async () => {
    if (ticket) {
      await generateTicketsPDF([ticket.id], ticket.validDay)
    }
  }

  const Barcode = ({ value }: { value: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (canvasRef.current && containerRef.current) {
        // Generate barcode horizontally first
        JsBarcode(canvasRef.current, value, {
          format: 'CODE128',
          width: 2.2,
          height: 40, // This will become the width after rotation
          displayValue: true,
          background: '#ffffff',
          lineColor: '#000000',
          margin: 0,
          fontSize: 14,
          textMargin: 0,
          flat: false
        })
        
        // Apply rotation to the container
        containerRef.current.style.transform = 'rotate(90deg)'
        containerRef.current.style.transformOrigin = 'center center'
      }
    }, [value])

    return (
      <div ref={containerRef} style={{ 
        width: '70px', // This becomes height after rotation
        height: '500px', // This becomes width after rotation
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <canvas ref={canvasRef} />
      </div>
    )
  }

  if (!ticket) return null


  return (
    <Dialog open={!!ticket} onOpenChange={() => onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-lg bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900 flex items-center justify-between text-lg">
            Ticket Preview
            <div className="flex gap-1 sm:gap-2 pr-4">
              <Button
                onClick={handleDownload}
                size="sm"
                variant="outline"
                className="text-gray-700 hover:bg-gray-50 px-2 sm:px-4"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Download</span>
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Status and Valid Day Badges */}
          <div className="flex justify-center gap-3">
            <Badge
              variant={ticket.status === 'redeemed' ? 'default' : 'secondary'}
              className={
                ticket.status === 'redeemed'
                  ? 'bg-green-100 text-green-700 border-green-300'
                  : 'bg-blue-100 text-blue-700 border-blue-300'
              }
            >
              {ticket.status.toUpperCase()}
            </Badge>
            <Badge
              variant="outline"
              className={
                ticket.validDay === 'day1'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : ticket.validDay === 'day2'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : ticket.validDay === 'day3'
                  ? 'bg-orange-50 text-orange-700 border-orange-200'
                  : 'bg-green-50 text-green-700 border-green-200'
              }
            >
              Valid {ticket.validDay === 'day1' ? 'Day 1' : ticket.validDay === 'day2' ? 'Day 2' : ticket.validDay === 'day3' ? 'Day 3' : 'Day 4'}
            </Badge>
          </div>

          {/* Ticket Preview */}
          <div>
            <div className="relative" style={{ backgroundColor: '#f6f6f6', padding: '20px', transform: 'rotate(-90deg)'}}>
              {/* Custom Ticket Design */}
              <div className="relative flex">
                {/* Barcode on the left side */}
                <div className="absolute left-0 top-[28px] h-full z-10" style={{ width: '40px', transform: 'scale(0.7)' }}>
                  <Barcode value={ticket.id} />
                </div>
                
                {/* Ticket image */}
                <Image
                  src={`/${ticket.validDay}-ticket.png`}
                  alt={`${ticket.validDay} ticket design`}
                  width={400}
                  height={600}
                  className="w-full object-contain"
                  style={{ height: '36rem' }}
                  priority
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleGeneratePDF}
              className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full sm:flex-1 text-gray-700 hover:bg-gray-50"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}