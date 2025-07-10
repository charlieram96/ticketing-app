'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, RefreshCw, Filter, BadgeCheck, Eye, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import BadgePreview from '@/components/BadgePreview'

interface BadgeData {
  badgeId: string
  name: string
  department: string
  checkInHistory: { timestamp: string }[]
}

export default function BadgesPage() {
  const [badges, setBadges] = useState<BadgeData[]>([])
  const [filteredBadges, setFilteredBadges] = useState<BadgeData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBadge, setSelectedBadge] = useState<BadgeData | null>(null)

  useEffect(() => {
    fetchBadges()
  }, [])

  useEffect(() => {
    filterBadges()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, badges])

  const fetchBadges = async () => {
    try {
      const response = await fetch('/api/badges')
      const data = await response.json()
      const badgesData = Array.isArray(data) ? data : []
      setBadges(badgesData)
      setFilteredBadges(badgesData)
    } catch (error) {
      console.error('Error fetching badges:', error)
      setBadges([])
      setFilteredBadges([])
    } finally {
      setIsLoading(false)
    }
  }

  const filterBadges = () => {
    let filtered = badges

    if (searchQuery) {
      filtered = filtered.filter(badge => 
        badge.badgeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        badge.department.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredBadges(filtered)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getLastCheckIn = (history: { timestamp: string }[]) => {
    if (history.length === 0) return '-'
    return formatDate(history[history.length - 1].timestamp)
  }

  const stats = {
    total: badges.length,
    checkedInToday: badges.filter(b => {
      if (b.checkInHistory.length === 0) return false
      const lastCheckIn = new Date(b.checkInHistory[b.checkInHistory.length - 1].timestamp)
      const today = new Date()
      return lastCheckIn.toDateString() === today.toDateString()
    }).length,
    totalCheckIns: badges.reduce((sum, b) => sum + b.checkInHistory.length, 0),
    uniqueDepartments: [...new Set(badges.map(b => b.department))].length,
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
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
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Badge Management</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Monitor and manage all badges</p>
              </div>
            </div>
            <Button
              onClick={fetchBadges}
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
                      <p className="text-xs sm:text-sm text-gray-600">Total Badges</p>
                      <p className="text-xl sm:text-3xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="rounded-full bg-purple-100 p-2 sm:p-3 mt-2 sm:mt-0">
                      <BadgeCheck className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
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
                      <p className="text-xs sm:text-sm text-gray-600">Checked In Today</p>
                      <p className="text-xl sm:text-3xl font-bold text-gray-900">{stats.checkedInToday}</p>
                    </div>
                    <div className="rounded-full bg-green-100 p-2 sm:p-3 mt-2 sm:mt-0">
                      <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
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
                      <p className="text-xs sm:text-sm text-gray-600">Total Check-ins</p>
                      <p className="text-xl sm:text-3xl font-bold text-gray-900">{stats.totalCheckIns}</p>
                    </div>
                    <div className="rounded-full bg-blue-100 p-2 sm:p-3 mt-2 sm:mt-0">
                      <RefreshCw className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
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
                      <p className="text-xs sm:text-sm text-gray-600">Departments</p>
                      <p className="text-xl sm:text-3xl font-bold text-gray-900">{stats.uniqueDepartments}</p>
                    </div>
                    <div className="rounded-full bg-orange-100 p-2 sm:p-3 mt-2 sm:mt-0">
                      <Users className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600" />
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
                Search
              </CardTitle>
              <CardDescription className="text-gray-600">
                Find badges by ID, name, or department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search badges..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </CardContent>
          </Card>

          {/* Badges Table */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900">Badges</CardTitle>
              <CardDescription className="text-gray-600">
                Showing {filteredBadges.length} of {badges.length} badges • Click any badge to view details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-8 w-8 rounded-full border-2 border-gray-300 border-t-purple-600"
                  />
                  <span className="ml-3 text-gray-600">Loading badges...</span>
                </div>
              ) : filteredBadges.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No badges found</p>
                </div>
              ) : (
                <div className="rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-gray-50">
                          <TableHead className="text-gray-700 min-w-[120px]">Badge ID</TableHead>
                          <TableHead className="text-gray-700">Name</TableHead>
                          <TableHead className="text-gray-700">Department</TableHead>
                          <TableHead className="text-gray-700 text-center">Check-ins</TableHead>
                          <TableHead className="text-gray-700 hidden sm:table-cell">Last Check-in</TableHead>
                          <TableHead className="text-gray-700 w-12">
                            <Eye className="h-4 w-4" />
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBadges.map((badge) => (
                          <motion.tr
                            key={badge.badgeId}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="hover:bg-gray-50 cursor-pointer transition-all duration-200"
                            onClick={() => setSelectedBadge(badge)}
                          >
                            <TableCell className="font-mono text-gray-900 text-sm">
                              <div className="max-w-[100px] truncate">{badge.badgeId}</div>
                            </TableCell>
                            <TableCell className="text-gray-900">
                              {badge.name}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                {badge.department}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-blue-100 text-blue-700">
                                {badge.checkInHistory.length}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-600 text-sm hidden sm:table-cell">
                              {getLastCheckIn(badge.checkInHistory)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Eye className="h-4 w-4 text-purple-600 opacity-60" />
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

      {/* Badge Preview Modal */}
      <BadgePreview 
        badge={selectedBadge} 
        onClose={() => setSelectedBadge(null)} 
      />
      </div>
    </div>
  )
}