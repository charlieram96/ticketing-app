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
import Image from 'next/image'

export default function GeneratePage() {
  const [quantity, setQuantity] = useState('')
  const [validDay, setValidDay] = useState<'day1' | 'day2' | 'day3'>('day1')
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
        body: JSON.stringify({ quantity: parseInt(quantity), validDay }),
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
          width: 1,
          height: 26,
          displayValue: false,
          background: '#ffffff',
          lineColor: '#000000',
          margin: 3
        })
      }
    }, [value])

    return <canvas ref={canvasRef} />
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>
      <div className="relative z-10">
      {/* Header */}
      <header className="bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Generate Tickets</h1>
                <p className="text-sm text-gray-600">Create and print new event tickets</p>
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
              <Card className="bg-gray-50/50">
                <CardHeader className="text-center">
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600"
                  >
                    <Zap className="h-8 w-8 text-white" />
                  </motion.div>
                  <CardTitle className="text-3xl font-bold text-gray-900">
                    Create New Tickets
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-lg">
                    Generate unique ticket IDs with QR codes and barcodes
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
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
                      className="bg-white text-gray-900 placeholder:text-gray-400"
                    />
                    <p className="text-xs text-gray-500">
                      Each ticket will have a unique ID, QR code, and barcode
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Valid Event Day
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['day1', 'day2', 'day3'] as const).map((day) => (
                        <motion.div key={day} whileTap={{ scale: 0.98 }}>
                          <Button
                            type="button"
                            onClick={() => setValidDay(day)}
                            variant={validDay === day ? "default" : "outline"}
                            className={`h-12 w-full ${
                              validDay === day 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {day === 'day1' ? 'Day 1' : day === 'day2' ? 'Day 2' : 'Day 3'}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      Tickets will only be valid for the selected event day
                    </p>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={!quantity || isGenerating || parseInt(quantity) < 1 || parseInt(quantity) > 1000}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2 h-5 w-5 rounded-full border-2 border-blue-300 border-t-white"
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
                <Card className="bg-white">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="rounded-full bg-blue-100 p-3 w-fit">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Unique IDs</h3>
                      <p className="text-sm text-gray-600">
                        Each ticket gets a unique alphanumeric ID for secure tracking
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="rounded-full bg-gray-100 p-3 w-fit">
                        <Printer className="h-6 w-6 text-gray-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Print Ready</h3>
                      <p className="text-sm text-gray-600">
                        Professional layout optimized for printing and cutting
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="rounded-full bg-green-100 p-3 w-fit">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Dual Format</h3>
                      <p className="text-sm text-gray-600">
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
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Successfully generated {generatedTickets.length} tickets and saved to database!
                </AlertDescription>
              </Alert>

              {/* Controls */}
              <Card className="bg-gray-50/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-900 flex items-center gap-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {generatedTickets.length}
                        </Badge>
                        Generated Tickets
                      </CardTitle>
                      <CardDescription className="text-gray-600">
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
                          setValidDay('day1')
                          setGeneratedTickets([])
                        }}
                        variant="outline"
                        className="text-gray-700 hover:bg-gray-50"
                      >
                        Generate More
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Printable Preview */}
              <div ref={printRef} className="print-container" style={{ padding: '20px', backgroundColor: '#f6f6f6' }}>
                <div className="grid grid-cols-3 md:grid-cols-3 gap-6 print:grid-cols-3">
                  {generatedTickets.map((ticketId, index) => (
                    <motion.div
                      key={ticketId}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="print:break-inside-avoid"
                    >
                      {/* Custom Ticket Design */}
                      <div className="relative max-w-xs mx-auto">
                        <Image
                          src={`/${validDay}-ticket.png`}
                          alt={`${validDay} ticket design`}
                          width={500}
                          height={1000}
                          className="w-full object-contain"
                          style={{ height: '29rem' }}
                          priority
                        />
                        
                        {/* Barcode overlay positioned 10px from bottom */}
                        <div className="absolute bottom-[10px] left-1/2 transform -translate-x-1/2">
                          <Barcode value={ticketId} />
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
      </div>

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
            margin: 0.3in;
            size: auto;
          }
          /* Ensure images print properly */
          img {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}