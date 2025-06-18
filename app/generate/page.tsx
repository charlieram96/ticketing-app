'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Download, Printer } from 'lucide-react'
import Link from 'next/link'
import QRCode from 'react-qr-code'
import JsBarcode from 'jsbarcode'
import { useEffect, useRef } from 'react'

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/10 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/20 transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
              </Link>
              <h1 className="text-2xl font-bold text-white">Generate Tickets</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {!showPreview ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-6">Create New Tickets</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-white/80 text-sm font-semibold mb-2 block">
                    Number of Tickets
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Enter quantity (1-1000)"
                    min="1"
                    max="1000"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerate}
                  disabled={!quantity || isGenerating}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Generate Tickets
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">
                    Generated {generatedTickets.length} Tickets
                  </h2>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePrint}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                    >
                      <Printer className="w-5 h-5" />
                      Print All
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowPreview(false)
                        setQuantity('')
                      }}
                      className="bg-white/20 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                      Generate More
                    </motion.button>
                  </div>
                </div>

                <div className="text-white/60 text-sm mb-4">
                  Tickets have been saved to the database and are ready to use.
                </div>
              </div>

              {/* Printable Preview */}
              <div ref={printRef} className="print-container">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
                  {generatedTickets.map((ticketId) => (
                    <motion.div
                      key={ticketId}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-xl p-6 shadow-lg print:break-inside-avoid"
                    >
                      <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                        Event Ticket
                      </h3>
                      
                      <div className="space-y-4">
                        {/* QR Code */}
                        <div className="flex justify-center">
                          <QRCode
                            value={ticketId}
                            size={150}
                            level="H"
                            style={{ background: 'white' }}
                          />
                        </div>

                        {/* Barcode */}
                        <div className="flex justify-center">
                          <Barcode value={ticketId} />
                        </div>

                        {/* Ticket ID */}
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Ticket ID</p>
                          <p className="font-mono font-bold text-lg">{ticketId}</p>
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
        }
      `}</style>
    </div>
  )
}