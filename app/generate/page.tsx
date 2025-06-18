'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Download, Printer, Zap, FileText, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import QRCode from 'react-qr-code'
import JsBarcode from 'jsbarcode'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function GeneratePage() {
  const [quantity, setQuantity] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedTickets, setGeneratedTickets] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const handleGenerate = async () => {
    if (!quantity || parseInt(quantity) < 1) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: parseInt(quantity) }),
      })

      const data = await response.json()
      if (response.ok) {
        setGeneratedTickets(data.tickets)
        setShowPreview(true)
      }
    } catch (error) {
      console.error('Error generating tickets:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrint = () => {
    window.print()
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
        })
      }
    }, [value])

    return <canvas ref={canvasRef} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Generate Tickets</h1>
                <p className="text-sm text-white/60">Create and print new event tickets</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {!showPreview ? (
            <div className="space-y-8">
              {/* Generation Form */}
              <Card className="border-white/10 bg-black/20 backdrop-blur-md">
                <CardHeader className="text-center">
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600"
                  >
                    <Zap className="h-8 w-8 text-white" />
                  </motion.div>
                  <CardTitle className="text-3xl font-bold text-white">
                    Create New Tickets
                  </CardTitle>
                  <CardDescription className="text-white/60 text-lg">
                    Generate unique ticket IDs with QR codes and barcodes
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="quantity" className="text-sm font-medium text-white/80">
                      Number of Tickets
                    </label>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Enter quantity (1-1000)"
                      min="1"
                      max="1000"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-purple-500 focus:ring-purple-500"
                    />
                    <p className="text-xs text-white/50">
                      Each ticket will have a unique ID, QR code, and barcode
                    </p>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={!quantity || isGenerating || parseInt(quantity) < 1 || parseInt(quantity) > 1000}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2 h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                        />
                        Generating Tickets...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-5 w-5" />
                        Generate {quantity || 0} Tickets
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-purple-500/20 bg-purple-500/5 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="rounded-full bg-purple-600/20 p-3 w-fit">
                        <FileText className="h-6 w-6 text-purple-400" />
                      </div>
                      <h3 className="font-semibold text-white">Unique IDs</h3>
                      <p className="text-sm text-white/60">
                        Each ticket gets a unique alphanumeric ID for secure tracking
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-500/20 bg-blue-500/5 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="rounded-full bg-blue-600/20 p-3 w-fit">
                        <Printer className="h-6 w-6 text-blue-400" />
                      </div>
                      <h3 className="font-semibold text-white">Print Ready</h3>
                      <p className="text-sm text-white/60">
                        Professional layout optimized for printing and cutting
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-500/20 bg-green-500/5 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="rounded-full bg-green-600/20 p-3 w-fit">
                        <CheckCircle2 className="h-6 w-6 text-green-400" />
                      </div>
                      <h3 className="font-semibold text-white">Dual Format</h3>
                      <p className="text-sm text-white/60">
                        Both QR codes and barcodes for maximum compatibility
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Success Alert */}
              <Alert className="border-green-500/20 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-400">
                  Successfully generated {generatedTickets.length} tickets and saved to database!
                </AlertDescription>
              </Alert>

              {/* Controls */}
              <Card className="border-white/10 bg-black/20 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                          {generatedTickets.length}
                        </Badge>
                        Generated Tickets
                      </CardTitle>
                      <CardDescription className="text-white/60">
                        Ready for printing and distribution
                      </CardDescription>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={handlePrint}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Printer className="mr-2 h-4 w-4" />
                        Print All
                      </Button>
                      <Button
                        onClick={() => {
                          setShowPreview(false)
                          setQuantity('')
                          setGeneratedTickets([])
                        }}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Generate More
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Printable Preview */}
              <div ref={printRef} className="print-container">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
                  {generatedTickets.map((ticketId, index) => (
                    <motion.div
                      key={ticketId}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl p-6 shadow-lg print:break-inside-avoid border-2 border-gray-100"
                    >
                      <div className="text-center space-y-4">
                        <div className="border-b border-gray-200 pb-4">
                          <h3 className="text-xl font-bold text-gray-800 mb-1">
                            Event Ticket
                          </h3>
                          <p className="text-sm text-gray-500">Admit One</p>
                        </div>
                        
                        {/* QR Code */}
                        <div className="flex justify-center bg-gray-50 p-4 rounded-lg">
                          <QRCode
                            value={ticketId}
                            size={120}
                            level="H"
                            style={{ background: 'white', padding: '8px' }}
                          />
                        </div>

                        {/* Barcode */}
                        <div className="flex justify-center bg-gray-50 p-3 rounded-lg">
                          <Barcode value={ticketId} />
                        </div>

                        {/* Ticket ID */}
                        <div className="border-t border-gray-200 pt-4">
                          <p className="text-xs text-gray-500 mb-1">Ticket ID</p>
                          <p className="font-mono font-bold text-sm text-gray-800 bg-gray-100 px-2 py-1 rounded">
                            {ticketId}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container,
          .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            margin: 0.5in;
            size: auto;
          }
        }
      `}</style>
    </div>
  )
}