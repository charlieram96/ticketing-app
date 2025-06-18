'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, CheckCircle, Clock, RefreshCw, Filter, TrendingUp, Users, TicketCheck } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
    redeemRate: tickets.length > 0 ? Math.round((tickets.filter(t => t.status === 'redeemed').length / tickets.length) * 100) : 0
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
                <h1 className="text-2xl font-bold text-white">Ticket Management</h1>
                <p className="text-sm text-white/60">Monitor and manage all tickets</p>
              </div>
            </div>
            <Button
              onClick={fetchTickets}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto space-y-8"
        >
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div whileHover={{ scale: 1.02 }}>
              <Card className="border-white/10 bg-black/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/60">Total Tickets</p>
                      <p className="text-3xl font-bold text-white">{stats.total}</p>
                    </div>
                    <div className="rounded-full bg-purple-600/20 p-3">
                      <TicketCheck className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }}>
              <Card className="border-green-500/20 bg-green-500/5 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/60">Redeemed</p>
                      <p className="text-3xl font-bold text-white">{stats.redeemed}</p>
                    </div>
                    <div className="rounded-full bg-green-600/20 p-3">
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }}>
              <Card className="border-blue-500/20 bg-blue-500/5 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/60">Available</p>
                      <p className="text-3xl font-bold text-white">{stats.unredeemed}</p>
                    </div>
                    <div className="rounded-full bg-blue-600/20 p-3">
                      <Clock className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }}>
              <Card className="border-orange-500/20 bg-orange-500/5 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/60">Redeem Rate</p>
                      <p className="text-3xl font-bold text-white">{stats.redeemRate}%</p>
                    </div>
                    <div className="rounded-full bg-orange-600/20 p-3">
                      <TrendingUp className="h-6 w-6 text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Search and Filter */}
          <Card className="border-white/10 bg-black/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter & Search
              </CardTitle>
              <CardDescription className="text-white/60">
                Find and filter tickets by ID or status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <Input
                    placeholder="Search by ticket ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
                <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-auto">
                  <TabsList className="bg-white/5">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="redeemed" className="data-[state=active]:bg-green-600">
                      Redeemed
                    </TabsTrigger>
                    <TabsTrigger value="unredeemed" className="data-[state=active]:bg-blue-600">
                      Available
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          {/* Tickets Table */}
          <Card className="border-white/10 bg-black/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Tickets</CardTitle>
              <CardDescription className="text-white/60">
                Showing {filteredTickets.length} of {tickets.length} tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-8 w-8 rounded-full border-2 border-white/30 border-t-white"
                  />
                  <span className="ml-3 text-white/60">Loading tickets...</span>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-white/60">No tickets found</p>
                </div>
              ) : (
                <div className="rounded-lg border border-white/10 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-white/80">Ticket ID</TableHead>
                        <TableHead className="text-white/80">Status</TableHead>
                        <TableHead className="text-white/80">Created</TableHead>
                        <TableHead className="text-white/80">Redeemed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTickets.map((ticket) => (
                        <motion.tr
                          key={ticket.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-white/10 hover:bg-white/5"
                        >
                          <TableCell className="font-mono text-white">
                            {ticket.id}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={ticket.status === 'redeemed' ? 'default' : 'secondary'}
                              className={
                                ticket.status === 'redeemed'
                                  ? 'bg-green-600/20 text-green-400 border-green-600/30'
                                  : 'bg-blue-600/20 text-blue-400 border-blue-600/30'
                              }
                            >
                              {ticket.status === 'redeemed' ? (
                                <CheckCircle className="mr-1 h-3 w-3" />
                              ) : (
                                <Clock className="mr-1 h-3 w-3" />
                              )}
                              {ticket.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white/60 text-sm">
                            {formatDate(ticket.createdAt)}
                          </TableCell>
                          <TableCell className="text-white/60 text-sm">
                            {ticket.redeemedAt ? formatDate(ticket.redeemedAt) : '-'}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}