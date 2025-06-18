'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, Download, Printer } from 'lucide-react'
import QRCode from 'react-qr-code'
import JsBarcode from 'jsbarcode'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface TicketPreviewProps {
  ticket: {
    id: string
    status: 'unredeemed' | 'redeemed'
    createdAt: string
    redeemedAt?: string
    resetAt?: string
  } | null
  onClose: () => void
}

export default function TicketPreview({ ticket, onClose }: TicketPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Ticket - ${ticket?.id}</title>
              <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                .ticket { 
                  max-width: 400px; 
                  margin: 0 auto; 
                  padding: 20px; 
                  border: 2px solid #e5e7eb; 
                  border-radius: 12px;
                  background: white;
                }
                .ticket-header { text-align: center; margin-bottom: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 15px; }
                .ticket-content { text-align: center; }
                .qr-section, .barcode-section { 
                  margin: 20px 0; 
                  padding: 15px; 
                  background: #f9fafb; 
                  border-radius: 8px; 
                }
                .ticket-id { 
                  font-family: monospace; 
                  font-weight: bold; 
                  font-size: 14px; 
                  background: #f3f4f6; 
                  padding: 8px; 
                  border-radius: 4px; 
                  margin-top: 15px;
                }
                @media print {
                  body { margin: 0; }
                  .ticket { border: 1px solid #000; }
                }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
        printWindow.close()
      }
    }
  }

  const handleDownload = () => {
    if (printRef.current && ticket) {
      // Create a canvas to render the ticket
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (ctx) {
        canvas.width = 400
        canvas.height = 600
        
        // White background
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Add ticket content (simplified version)
        ctx.fillStyle = 'black'
        ctx.font = 'bold 20px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('Event Ticket', canvas.width / 2, 40)
        
        ctx.font = '16px monospace'
        ctx.fillText(ticket.id, canvas.width / 2, canvas.height - 40)
        
        // Download as image
        const link = document.createElement('a')
        link.download = `ticket-${ticket.id}.png`
        link.href = canvas.toDataURL()
        link.click()
      }
    }
  }

  const Barcode = ({ value }: { value: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
      if (canvasRef.current) {
        JsBarcode(canvasRef.current, value, {
          format: 'CODE128',
          width: 2,
          height: 60,
          displayValue: false,
          background: '#f9fafb',
          lineColor: '#000000',
        })
      }
    }, [value])

    return <canvas ref={canvasRef} />
  }

  if (!ticket) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={!!ticket} onOpenChange={() => onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-lg bg-white border-gray-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900 flex items-center justify-between text-lg">
            Ticket Preview
            <div className="flex gap-1 sm:gap-2">
              <Button
                onClick={handleDownload}
                size="sm"
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-2 sm:px-4"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Download</span>
              </Button>
              <Button
                onClick={handlePrint}
                size="sm"
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-2 sm:px-4"
              >
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Print</span>
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
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
          </div>

          {/* Printable Ticket Preview */}
          <div ref={printRef}>
            <Card className="bg-white border-gray-200 print:shadow-none">
              <CardContent className="p-4 sm:p-6">
                <div className="ticket">
                  <div className="ticket-header">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
                      Event Ticket
                    </h3>
                    <p className="text-sm text-gray-500">Admit One</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Created: {formatDate(ticket.createdAt)}
                    </p>
                    {ticket.redeemedAt && (
                      <p className="text-xs text-green-600">
                        Redeemed: {formatDate(ticket.redeemedAt)}
                      </p>
                    )}
                  </div>
                  
                  <div className="ticket-content">
                    {/* QR Code */}
                    <div className="qr-section">
                      <p className="text-xs text-gray-500 mb-3">QR Code</p>
                      <div className="flex justify-center">
                        <QRCode
                          value={ticket.id}
                          size={120}
                          level="H"
                          style={{ background: '#f9fafb', padding: '8px' }}
                          className="sm:w-[150px] sm:h-[150px]"
                        />
                      </div>
                    </div>

                    {/* Barcode */}
                    <div className="barcode-section">
                      <p className="text-xs text-gray-500 mb-3">Barcode</p>
                      <div className="flex justify-center">
                        <Barcode value={ticket.id} />
                      </div>
                    </div>

                    {/* Ticket ID */}
                    <div className="ticket-id">
                      <p className="text-xs text-gray-500 mb-1">Ticket ID</p>
                      <p className="font-mono font-bold text-sm text-gray-800 break-all">
                        {ticket.id}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handlePrint}
              className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Ticket
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full sm:flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}