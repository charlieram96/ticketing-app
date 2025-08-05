'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Download, FileSpreadsheet, Zap, FileText, CheckCircle2, Ticket, Users } from 'lucide-react'
import Link from 'next/link'
import QRCode from 'react-qr-code'
import JsBarcode from 'jsbarcode'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Image from 'next/image'
import { generateTicketsPDF, generateDelegateTicketsPDF } from '@/components/TicketsPDF'

export default function GeneratePage() {
  const [quantity, setQuantity] = useState('')
  const [validDay, setValidDay] = useState<'day1' | 'day2' | 'day3' | 'day4' | 'day5'>('day1')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedTickets, setGeneratedTickets] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)
  
  // Delegate ticket states
  const [delegateQuantity, setDelegateQuantity] = useState('')
  const [delegateType, setDelegateType] = useState<'delegate-ticket-1' | 'delegate-ticket-2' | 'delegate-ticket-3'>('delegate-ticket-1')
  const [isGeneratingDelegate, setIsGeneratingDelegate] = useState(false)
  const [generatedDelegateTickets, setGeneratedDelegateTickets] = useState<number[]>([])
  const [showDelegatePreview, setShowDelegatePreview] = useState(false)

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

  const handleGeneratePDF = async () => {
    await generateTicketsPDF(generatedTickets, validDay)
  }

  const handleGenerateDelegate = async () => {
    if (!delegateQuantity || parseInt(delegateQuantity) < 1) return

    setIsGeneratingDelegate(true)
    try {
      // Generate array of indices for delegate tickets (no unique IDs needed)
      const delegateTickets = Array.from({ length: parseInt(delegateQuantity) }, (_, i) => i + 1)
      setGeneratedDelegateTickets(delegateTickets)
      setShowDelegatePreview(true)
    } catch (error) {
      console.error('Error generating delegate tickets:', error)
    } finally {
      setIsGeneratingDelegate(false)
    }
  }

  const handleGenerateDelegatePDF = async () => {
    await generateDelegateTicketsPDF(generatedDelegateTickets, delegateType)
  }

  const Barcode = ({ value }: { value: string }) => {
    const svgRef = useRef<SVGSVGElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (svgRef.current && containerRef.current) {
        // Generate barcode horizontally first using SVG
        JsBarcode(svgRef.current, value, {
          format: 'CODE128',
          width: 3,
          height: 80, // This will become the width after rotation
          displayValue: false, // No text from jsbarcode
          background: '#ffffff',
          lineColor: '#000000',
          margin: 0,
          flat: false
        })
        
      }
    }, [value])

    return (
      <div ref={containerRef} style={{ 
        width: '230px', // This becomes height after rotation
        height: '100px', // This becomes width after rotation
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        transform: 'rotate(90deg)',
        transformOrigin: 'center center'
      }}>
        <svg ref={svgRef} style={{ transform: 'rotate(90deg)', transformOrigin: 'center center' }}/>
        {/* Custom text overlay positioned in bottom right of barcode */}
        <div 
          style={{
            position: 'absolute',
            bottom: '29px',
            right: '-3px',
            backgroundColor: 'white',
            padding: '1px 4px 0px 2.5px',
            fontSize: '8px',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            color: 'black',
            zIndex: 10,
            transformOrigin: 'center center'
          }}
        >
          {value}
        </div>
      </div>
    )
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
          <Tabs defaultValue="regular" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="regular" className="flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                Regular Tickets
              </TabsTrigger>
              <TabsTrigger value="delegate" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Delegate Tickets
              </TabsTrigger>
            </TabsList>

            <TabsContent value="regular">
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
                      placeholder="Enter quantity (1-3000)"
                      min="1"
                      max="3000"
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
                    <div className="grid grid-cols-5 gap-3">
                      {(['day1', 'day2', 'day3', 'day4', 'day5'] as const).map((day) => (
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
                            {day === 'day1' ? 'Day 1' : day === 'day2' ? 'Day 2' : day === 'day3' ? 'Day 3' : day === 'day4' ? 'Day 4' : 'Day 5'}
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
                    disabled={!quantity || isGenerating || parseInt(quantity) < 1 || parseInt(quantity) > 3000}
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
                        <FileSpreadsheet className="h-6 w-6 text-gray-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">PDF Export</h3>
                      <p className="text-sm text-gray-600">
                        Export tickets as high-quality PDF for distribution
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
                        onClick={handleGeneratePDF}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Download PDF
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

              {/* Tickets Preview */}
              <div className="print-container" style={{ backgroundColor: '#f6f6f6' }}>
                {/* Split tickets into pages of 18 (6 rows x 3 columns) */}
                {Array.from({ length: Math.ceil(generatedTickets.length / 8) }, (_, pageIndex) => (
                  <div 
                    key={pageIndex} 
                    style={{ 
                      padding: '20px',
                      pageBreakAfter: pageIndex < Math.ceil(generatedTickets.length / 8) - 1 ? 'always' : 'auto',
                      minHeight: '100vh',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-6 print:grid-cols-2" style={{ gridTemplateRows: 'repeat(4, 236.2px)' }}>
                      {generatedTickets.slice(pageIndex * 8, (pageIndex + 1) * 8).map((ticketId, index) => (
                        <motion.div
                          key={ticketId}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="print:break-inside-avoid"
                          style={{ height: '236.2px' }}
                        >
                          {/* Custom Ticket Design */}
                          <div className="relative flex h-[236.2px] w-[363.2px]" >
                            {/* Barcode on the left side */}
                            <div className="absolute left-0 top-0 z-10" style={{ width: '90px', height: '290px', transform: 'scale(.92) translateX(-87px) translateY(65px)' }}>
                              <Barcode value={ticketId} />
                            </div>
                            
                            {/* Ticket image */}
                            <img src={`/${validDay}-ticket.png`} alt={`${validDay} ticket design`} className="w-full object-cover" style={{ width: '363.2px !important', height: '236.2px !important', }} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
            </TabsContent>

            <TabsContent value="delegate">
              {!showDelegatePreview ? (
                <div className="space-y-8">
                  {/* Delegate Generation Form */}
                  <Card className="bg-gray-50/50">
                    <CardHeader className="text-center">
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-600"
                      >
                        <Users className="h-8 w-8 text-white" />
                      </motion.div>
                      <CardTitle className="text-3xl font-bold text-gray-900">
                        Create Delegate Tickets
                      </CardTitle>
                      <CardDescription className="text-gray-600 text-lg">
                        Generate printable delegate tickets (no database storage)
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <label htmlFor="delegateQuantity" className="text-sm font-medium text-gray-700">
                          Number of Delegate Tickets
                        </label>
                        <Input
                          id="delegateQuantity"
                          type="number"
                          value={delegateQuantity}
                          onChange={(e) => setDelegateQuantity(e.target.value)}
                          placeholder="Enter quantity (1-1500)"
                          min="1"
                          max="1500"
                          className="bg-white text-gray-900 placeholder:text-gray-400"
                        />
                        <p className="text-xs text-gray-500">
                          Delegate tickets are static images for printing only
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Delegate Ticket Type
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {(['delegate-ticket-1', 'delegate-ticket-2', 'delegate-ticket-3'] as const).map((type) => (
                            <motion.div key={type} whileTap={{ scale: 0.98 }}>
                              <Button
                                type="button"
                                onClick={() => setDelegateType(type)}
                                variant={delegateType === type ? "default" : "outline"}
                                className={`h-12 w-full ${
                                  delegateType === type 
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {type === 'delegate-ticket-1' ? 'Day 3' : type === 'delegate-ticket-2' ? 'Day 4' : 'Day 5'}
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">
                          Select the delegate ticket design to print
                        </p>
                      </div>

                      <Button
                        onClick={handleGenerateDelegate}
                        disabled={!delegateQuantity || isGeneratingDelegate || parseInt(delegateQuantity) < 1 || parseInt(delegateQuantity) > 1500}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                        size="lg"
                      >
                        {isGeneratingDelegate ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="mr-2 h-5 w-5 rounded-full border-2 border-purple-300 border-t-white"
                            />
                            Generating Delegate Tickets...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-5 w-5" />
                            Generate {delegateQuantity || 0} Delegate Tickets
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Delegate Features */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-white">
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="rounded-full bg-purple-100 p-3 w-fit">
                            <Users className="h-6 w-6 text-purple-600" />
                          </div>
                          <h3 className="font-semibold text-gray-900">Static Design</h3>
                          <p className="text-sm text-gray-600">
                            No unique IDs needed - just printable delegate tickets
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white">
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="rounded-full bg-gray-100 p-3 w-fit">
                            <FileSpreadsheet className="h-6 w-6 text-gray-600" />
                          </div>
                          <h3 className="font-semibold text-gray-900">PDF Export</h3>
                          <p className="text-sm text-gray-600">
                            6 tickets per page, optimized for printing
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
                          <h3 className="font-semibold text-gray-900">No Database</h3>
                          <p className="text-sm text-gray-600">
                            Print as many as needed without database storage
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Delegate Success Alert */}
                  <Alert className="border-purple-200 bg-purple-50">
                    <CheckCircle2 className="h-4 w-4 text-purple-600" />
                    <AlertDescription className="text-purple-700">
                      Successfully generated {generatedDelegateTickets.length} delegate tickets for printing!
                    </AlertDescription>
                  </Alert>

                  {/* Delegate Controls */}
                  <Card className="bg-gray-50/50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-gray-900 flex items-center gap-2">
                            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                              {generatedDelegateTickets.length}
                            </Badge>
                            Generated Delegate Tickets
                          </CardTitle>
                          <CardDescription className="text-gray-600">
                            Ready for printing (6 per page, rotated 90°)
                          </CardDescription>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            onClick={handleGenerateDelegatePDF}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Download PDF
                          </Button>
                          <Button
                            onClick={() => {
                              setShowDelegatePreview(false)
                              setDelegateQuantity('')
                              setDelegateType('delegate-ticket-1')
                              setGeneratedDelegateTickets([])
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

                  {/* Delegate Tickets Preview */}
                  <div className="print-container" style={{ backgroundColor: '#f6f6f6' }}>
                    {/* Split delegate tickets into pages of 6 (2 rows x 3 columns) */}
                    {Array.from({ length: Math.ceil(generatedDelegateTickets.length / 6) }, (_, pageIndex) => (
                      <div 
                        key={pageIndex} 
                        style={{ 
                          padding: '20px',
                          pageBreakAfter: pageIndex < Math.ceil(generatedDelegateTickets.length / 6) - 1 ? 'always' : 'auto',
                          minHeight: '100vh',
                          boxSizing: 'border-box'
                        }}
                      >
                        <div className="grid grid-cols-3 gap-6 print:grid-cols-3" style={{ gridTemplateRows: 'repeat(2, 350px)' }}>
                          {generatedDelegateTickets.slice(pageIndex * 6, (pageIndex + 1) * 6).map((ticketIndex, index) => (
                            <motion.div
                              key={`${pageIndex}-${ticketIndex}`}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className="print:break-inside-avoid flex justify-center items-center"
                              style={{ height: '350px' }}
                            >
                              {/* Delegate Ticket Design - Rotated 90 degrees */}
                              <div className="relative" style={{ transform: 'rotate(90deg)', transformOrigin: 'center center' }}>
                                <img 
                                  src={`/${delegateType}.png`} 
                                  alt={`${delegateType} design`} 
                                  className="object-cover" 
                                  style={{ width: '320px', height: '208px' }} 
                                />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
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
            print-color-adjust: exact;
          }
          /* Preserve canvas and transform styles during print */
          canvas {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
            print-color-adjust: exact;
          }
          /* Force barcode container to maintain its transform during print */
          div[style*="transform"] {
            -webkit-transform: scale(.19) translateX(-40px) translateY(640px) !important;
            transform: scale(.19) translateX(-40px) translateY(640px) !important;
          }
          /* Ensure barcode canvas maintains rotation */
          canvas[style*="rotate"] {
            -webkit-transform: rotate(90deg) !important;
            transform: rotate(90deg) !important;
          }
        }
      `}</style>
    </div>
  )
}