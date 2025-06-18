'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface Ticket {
  id: string
  status: 'unredeemed' | 'redeemed'
  createdAt: string
  redeemedAt?: string
  resetAt?: string
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'redeemed' | 'unredeemed'>('all')

  useEffect(() => {
    fetchTickets()
  }, [])

  useEffect(() => {
    filterTickets()
  }, [searchQuery, filter, tickets])

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/tickets')
      const data = await response.json()
      setTickets(data)
      setFilteredTickets(data)
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterTickets = () => {
    let filtered = tickets

    if (searchQuery) {
      filtered = filtered.filter(ticket => 
        ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === filter)
    }

    setFilteredTickets(filtered)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const stats = {
    total: tickets.length,
    redeemed: tickets.filter(t => t.status === 'redeemed').length,
    unredeemed: tickets.filter(t => t.status === 'unredeemed').length,
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
              <h1 className="text-2xl font-bold text-white">Manage Tickets</h1>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchTickets}
              className="bg-white/10 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/20 transition-all"
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Tickets</p>
                  <p className="text-3xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="bg-purple-600/20 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Redeemed</p>
                  <p className="text-3xl font-bold text-white">{stats.redeemed}</p>
                </div>
                <div className="bg-green-600/20 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Unredeemed</p>
                  <p className="text-3xl font-bold text-white">{stats.unredeemed}</p>
                </div>
                <div className="bg-blue-600/20 p-3 rounded-lg">
                  <XCircle className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by ticket ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                {(['all', 'redeemed', 'unredeemed'] as const).map((f) => (
                  <motion.button
                    key={f}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-3 rounded-lg font-semibold capitalize transition-all ${
                      filter === f
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    {f}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Tickets List */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white/60">Loading tickets...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-white/60">No tickets found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Ticket ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Created</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Redeemed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredTickets.map((ticket) => (
                      <motion.tr
                        key={ticket.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono text-white">{ticket.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            ticket.status === 'redeemed'
                              ? 'bg-green-600/20 text-green-400'
                              : 'bg-blue-600/20 text-blue-400'
                          }`}>
                            {ticket.status === 'redeemed' ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <Clock className="w-3 h-3 mr-1" />
                            )}
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white/60 text-sm">
                          {formatDate(ticket.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-white/60 text-sm">
                          {ticket.redeemedAt ? formatDate(ticket.redeemedAt) : '-'}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  )
}