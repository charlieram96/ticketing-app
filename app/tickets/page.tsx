'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, CheckCircle, Clock, RefreshCw, Filter, TrendingUp, TicketCheck, Eye } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import TicketPreview from '@/components/TicketPreview'

interface Ticket {
  id: string
  status: 'unredeemed' | 'redeemed'
  createdAt: string
  redeemedAt?: string
  resetAt?: string
  validDay: 'day1' | 'day2' | 'day3'
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'redeemed' | 'unredeemed'>('all')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  useEffect(() => {
    fetchTickets()
  }, [])

  useEffect(() => {
    filterTickets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filter, tickets])

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/tickets')
      const data = await response.json()
      // Ensure data is an array
      const ticketsData = Array.isArray(data) ? data : []
      setTickets(ticketsData)
      setFilteredTickets(ticketsData)
    } catch (error) {
      console.error('Error fetching tickets:', error)
      // Set empty array on error
      setTickets([])
      setFilteredTickets([])
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
    redeemRate: tickets.length > 0 ? Math.round((tickets.filter(t => t.status === 'redeemed').length / tickets.length) * 100) : 0
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
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100 px-2 sm:px-4">
                  <ArrowLeft className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              </Link>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Ticket Management</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Monitor and manage all tickets</p>
              </div>
            </div>
            <Button
              onClick={fetchTickets}
              variant="outline"
              size="sm"
              className="text-gray-700 hover:bg-gray-50 px-2 sm:px-4"
            >
              <RefreshCw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto space-y-4 sm:space-y-8"
        >
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
            <motion.div whileHover={{ scale: 1.02 }}>
              <Card className="bg-white">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center sm:justify-between">
                    <div className="text-center sm:text-left">
                      <p className="text-xs sm:text-sm text-gray-600">Total Tickets</p>
                      <p className="text-xl sm:text-3xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="rounded-full bg-blue-100 p-2 sm:p-3 mt-2 sm:mt-0">
                      <TicketCheck className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }}>
              <Card className="bg-white">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center sm:justify-between">
                    <div className="text-center sm:text-left">
                      <p className="text-xs sm:text-sm text-gray-600">Redeemed</p>
                      <p className="text-xl sm:text-3xl font-bold text-gray-900">{stats.redeemed}</p>
                    </div>
                    <div className="rounded-full bg-green-100 p-2 sm:p-3 mt-2 sm:mt-0">
                      <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }}>
              <Card className="bg-white">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center sm:justify-between">
                    <div className="text-center sm:text-left">
                      <p className="text-xs sm:text-sm text-gray-600">Available</p>
                      <p className="text-xl sm:text-3xl font-bold text-gray-900">{stats.unredeemed}</p>
                    </div>
                    <div className="rounded-full bg-blue-100 p-2 sm:p-3 mt-2 sm:mt-0">
                      <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }}>
              <Card className="bg-white">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center sm:justify-between">
                    <div className="text-center sm:text-left">
                      <p className="text-xs sm:text-sm text-gray-600">Redeem Rate</p>
                      <p className="text-xl sm:text-3xl font-bold text-gray-900">{stats.redeemRate}%</p>
                    </div>
                    <div className="rounded-full bg-orange-100 p-2 sm:p-3 mt-2 sm:mt-0">
                      <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Search and Filter */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter & Search
              </CardTitle>
              <CardDescription className="text-gray-600">
                Find and filter tickets by ID or status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by ticket ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-auto">
                  <TabsList className="bg-white">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="redeemed" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                      Redeemed
                    </TabsTrigger>
                    <TabsTrigger value="unredeemed" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                      Available
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          {/* Tickets Table */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900">Tickets</CardTitle>
              <CardDescription className="text-gray-600">
                Showing {filteredTickets.length} of {tickets.length} tickets • Click any ticket to view preview
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-8 w-8 rounded-full border-2 border-gray-300 border-t-blue-600"
                  />
                  <span className="ml-3 text-gray-600">Loading tickets...</span>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No tickets found</p>
                </div>
              ) : (
                <div className="rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-gray-50">
                          <TableHead className="text-gray-700 min-w-[120px]">Ticket ID</TableHead>
                          <TableHead className="text-gray-700">Status</TableHead>
                          <TableHead className="text-gray-700">Valid Day</TableHead>
                          <TableHead className="text-gray-700 hidden sm:table-cell">Created</TableHead>
                          <TableHead className="text-gray-700 hidden md:table-cell">Redeemed</TableHead>
                          <TableHead className="text-gray-700 w-12">
                            <Eye className="h-4 w-4" />
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTickets.map((ticket) => (
                          <motion.tr
                            key={ticket.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="hover:bg-gray-50 cursor-pointer transition-all duration-200"
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <TableCell className="font-mono text-gray-900 text-sm">
                              <div className="max-w-[100px] truncate">{ticket.id}</div>
                              <div className="sm:hidden text-xs text-gray-500 mt-1">
                                {formatDate(ticket.createdAt)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={ticket.status === 'redeemed' ? 'default' : 'secondary'}
                                className={
                                  ticket.status === 'redeemed'
                                    ? 'bg-green-100 text-green-700 text-xs'
                                    : 'bg-blue-100 text-blue-700 text-xs'
                                }
                              >
                                {ticket.status === 'redeemed' ? (
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                ) : (
                                  <Clock className="mr-1 h-3 w-3" />
                                )}
                                <span className="hidden sm:inline">{ticket.status.toUpperCase()}</span>
                                <span className="sm:hidden">{ticket.status === 'redeemed' ? 'R' : 'A'}</span>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  ticket.validDay === 'day1'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200 text-xs'
                                    : ticket.validDay === 'day2'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200 text-xs'
                                    : 'bg-orange-50 text-orange-700 border-orange-200 text-xs'
                                }
                              >
                                {ticket.validDay === 'day1' ? 'Day 1' : ticket.validDay === 'day2' ? 'Day 2' : 'Day 3'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-600 text-sm hidden sm:table-cell">
                              {formatDate(ticket.createdAt)}
                            </TableCell>
                            <TableCell className="text-gray-600 text-sm hidden md:table-cell">
                              {ticket.redeemedAt ? formatDate(ticket.redeemedAt) : '-'}
                            </TableCell>
                            <TableCell className="text-center">
                              <Eye className="h-4 w-4 text-blue-600 opacity-60" />
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Ticket Preview Modal */}
      <TicketPreview 
        ticket={selectedTicket} 
        onClose={() => setSelectedTicket(null)} 
      />
      </div>
    </div>
  )
}