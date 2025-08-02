'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, RefreshCw, Filter, BadgeCheck, Eye, Clock, Users, Plus, Edit, Mail, Send, CheckSquare, Square } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import BadgePreview from '@/components/BadgePreview'

interface BadgeData {
  badgeId: string
  name: string
  department: string
  email: string
  type: 'Badge' | 'Multiday Badge'
  days: number[]
  companion?: string
  checkInHistory: { timestamp: string; day?: number }[]
  scanHistory?: { day: number; timestamps: string[] }[]
}

export default function BadgesPage() {
  const [badges, setBadges] = useState<BadgeData[]>([])
  const [filteredBadges, setFilteredBadges] = useState<BadgeData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBadge, setSelectedBadge] = useState<BadgeData | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'regular' | 'multiday'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    department: '',
    email: '',
    type: 'Badge' as 'Badge' | 'Multiday Badge',
    days: [1, 2, 3, 4, 5] as number[],
    companion: ''
  })
  const [editForm, setEditForm] = useState<{
    badgeId: string
    name: string
    department: string
    email: string
    type: 'Badge' | 'Multiday Badge'
    days: number[]
    companion?: string
  } | null>(null)
  const [selectedBadgeIds, setSelectedBadgeIds] = useState<string[]>([])
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [isEmailSending, setIsEmailSending] = useState(false)
  const [emailResults, setEmailResults] = useState<any>(null)

  useEffect(() => {
    fetchBadges()
  }, [filterType]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    filterBadges()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, badges, filterType])

  const fetchBadges = async () => {
    try {
      const url = filterType === 'all' ? '/api/badges' : `/api/badges?type=${filterType}`
      const response = await fetch(url)
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
    regularBadges: badges.filter(b => b.type === 'Badge').length,
    multidayBadges: badges.filter(b => b.type === 'Multiday Badge').length,
    checkedInToday: badges.filter(b => {
      if (b.checkInHistory.length === 0) return false
      const lastCheckIn = new Date(b.checkInHistory[b.checkInHistory.length - 1].timestamp)
      const today = new Date()
      return lastCheckIn.toDateString() === today.toDateString()
    }).length,
    totalCheckIns: badges.reduce((sum, b) => sum + b.checkInHistory.length, 0),
    uniqueDepartments: [...new Set(badges.map(b => b.department))].length,
  }

  const handleUpdateBadge = async () => {
    if (!editForm || !editForm.name || !editForm.department || editForm.days.length === 0) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/badges/${editForm.badgeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          department: editForm.department,
          email: editForm.email,
          type: editForm.type,
          days: editForm.days,
          companion: editForm.companion
        }),
      })

      const data = await response.json()
      if (response.ok) {
        // Success - refresh badges and close modal
        await fetchBadges()
        setShowEditModal(false)
        setEditForm(null)
      } else {
        console.error('Error updating badge:', data.error)
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Error updating badge:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCreateBadge = async () => {
    if (!createForm.name || !createForm.department || createForm.days.length === 0) return

    setIsCreating(true)
    try {
      const response = await fetch('/api/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      })

      if (response.ok) {
        await response.json() // Parse response to avoid warning
        // Success - refresh badges and close modal
        await fetchBadges()
        setShowCreateModal(false)
        setCreateForm({
          name: '',
          department: '',
          email: '',
          type: 'Badge',
          days: [1, 2, 3, 4, 5],
          companion: ''
        })
      } else {
        // Try to parse error response
        let errorMessage = 'Failed to create badge'
        try {
          const data = await response.json()
          errorMessage = data.error || errorMessage
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage
        }
        console.error('Error creating badge:', errorMessage)
        alert(`Error creating badge: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Error creating badge:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleSelectAll = () => {
    const badgesWithEmail = filteredBadges.filter(badge => badge.email && badge.email.includes('@'))
    if (selectedBadgeIds.length === badgesWithEmail.length) {
      setSelectedBadgeIds([])
    } else {
      setSelectedBadgeIds(badgesWithEmail.map(badge => badge.badgeId))
    }
  }

  const handleSelectBadge = (badgeId: string) => {
    setSelectedBadgeIds(prev => 
      prev.includes(badgeId) 
        ? prev.filter(id => id !== badgeId)
        : [...prev, badgeId]
    )
  }

  const handleSendEmails = async () => {
    if (selectedBadgeIds.length === 0) return

    setIsEmailSending(true)
    try {
      const response = await fetch('/api/badges/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeIds: selectedBadgeIds }),
      })

      const data = await response.json()
      setEmailResults(data)
      
      if (response.ok) {
        // Clear selection after successful send
        setSelectedBadgeIds([])
      }
    } catch (error) {
      console.error('Error sending emails:', error)
      setEmailResults({
        success: false,
        error: 'Failed to send emails. Please try again.'
      })
    } finally {
      setIsEmailSending(false)
    }
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
            <div className="flex gap-2">
              <Button
                onClick={() => setShowCreateModal(true)}
                variant="default"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-4"
              >
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Create Badge</span>
              </Button>
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
                      <p className="text-xs sm:text-sm text-gray-600">Multiday Badges</p>
                      <p className="text-xl sm:text-3xl font-bold text-gray-900">{stats.multidayBadges}</p>
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
                Search & Filter
              </CardTitle>
              <CardDescription className="text-gray-600">
                Find badges by ID, name, department, or type
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search badges..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white text-gray-900 placeholder:text-gray-400"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterType('all')}
                  size="sm"
                >
                  All Badges ({stats.total})
                </Button>
                <Button
                  variant={filterType === 'regular' ? 'default' : 'outline'}
                  onClick={() => setFilterType('regular')}
                  size="sm"
                >
                  Regular ({stats.regularBadges})
                </Button>
                <Button
                  variant={filterType === 'multiday' ? 'default' : 'outline'}
                  onClick={() => setFilterType('multiday')}
                  size="sm"
                >
                  Multiday ({stats.multidayBadges})
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Email Section */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Badges
              </CardTitle>
              <CardDescription className="text-gray-600">
                Select badges to email barcodes to recipients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleSelectAll}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {selectedBadgeIds.length === filteredBadges.filter(b => b.email && b.email.includes('@')).length ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                    {selectedBadgeIds.length === filteredBadges.filter(b => b.email && b.email.includes('@')).length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <span className="text-sm text-gray-600">
                    {selectedBadgeIds.length} selected • {filteredBadges.filter(b => b.email && b.email.includes('@')).length} have email
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowEmailModal(true)}
                    disabled={selectedBadgeIds.length === 0 || isEmailSending}
                    variant="default"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Emails ({selectedBadgeIds.length})
                  </Button>
                </div>
              </div>
              
              {selectedBadgeIds.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-blue-900 mb-2">Selected Badges:</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedBadgeIds.map(badgeId => {
                      const badge = badges.find(b => b.badgeId === badgeId)
                      return badge ? (
                        <div key={badgeId} className="flex items-center gap-1 bg-white px-2 py-1 rounded border text-xs">
                          <span className="font-mono">{badgeId}</span>
                          <span>({badge.name})</span>
                          <button
                            onClick={() => handleSelectBadge(badgeId)}
                            className="text-red-500 hover:text-red-700 ml-1"
                          >
                            ×
                          </button>
                        </div>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Badges Table */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900">Badges</CardTitle>
              <CardDescription className="text-gray-600">
                Showing {filteredBadges.length} of {badges.length} badges • Click any badge to view barcode and details • Click edit icon to modify
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
                          <TableHead className="text-gray-700 w-12">
                            <button
                              onClick={handleSelectAll}
                              className="flex items-center justify-center w-4 h-4"
                            >
                              {selectedBadgeIds.length === filteredBadges.filter(b => b.email && b.email.includes('@')).length && filteredBadges.filter(b => b.email && b.email.includes('@')).length > 0 ? (
                                <CheckSquare className="h-4 w-4 text-blue-600" />
                              ) : (
                                <Square className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead className="text-gray-700 min-w-[120px]">Badge ID</TableHead>
                          <TableHead className="text-gray-700">Name</TableHead>
                          <TableHead className="text-gray-700">Department</TableHead>
                          <TableHead className="text-gray-700 hidden sm:table-cell">Email</TableHead>
                          <TableHead className="text-gray-700">Type</TableHead>
                          <TableHead className="text-gray-700 hidden sm:table-cell">Valid Days</TableHead>
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
                            <TableCell className="text-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (badge.email && badge.email.includes('@')) {
                                    handleSelectBadge(badge.badgeId)
                                  }
                                }}
                                disabled={!badge.email || !badge.email.includes('@')}
                                className="flex items-center justify-center w-4 h-4"
                              >
                                {selectedBadgeIds.includes(badge.badgeId) ? (
                                  <CheckSquare className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <Square className={`h-4 w-4 ${badge.email && badge.email.includes('@') ? 'text-gray-400 hover:text-blue-400' : 'text-gray-200'}`} />
                                )}
                              </button>
                            </TableCell>
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
                            <TableCell className="hidden sm:table-cell">
                              <div className="max-w-[150px] truncate text-sm text-gray-600">
                                {badge.email ? (
                                  <span className="text-blue-600">{badge.email}</span>
                                ) : (
                                  <span className="text-gray-400 italic">No email</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={badge.type === 'Multiday Badge' ? 'default' : 'outline'}
                                className={badge.type === 'Multiday Badge' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}
                              >
                                {badge.type === 'Multiday Badge' ? 'Multiday' : 'Regular'}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <div className="flex gap-1">
                                {badge.days.map(day => (
                                  <Badge 
                                    key={day} 
                                    variant="outline" 
                                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                  >
                                    {day}
                                  </Badge>
                                ))}
                              </div>
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
                              <div className="flex items-center justify-center gap-1">
                                <Eye className="h-4 w-4 text-purple-600 opacity-60" />
                                <Edit 
                                  className="h-3 w-3 text-gray-400 opacity-60" 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditForm({
                                      badgeId: badge.badgeId,
                                      name: badge.name,
                                      department: badge.department,
                                      email: badge.email,
                                      type: badge.type,
                                      days: badge.days,
                                      companion: badge.companion
                                    })
                                    setShowEditModal(true)
                                  }}
                                />
                              </div>
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
        onEdit={(badge) => {
          setEditForm(badge)
          setShowEditModal(true)
        }}
      />

      {/* Create Badge Modal */}
      <Dialog open={showCreateModal} onOpenChange={() => setShowCreateModal(false)}>
        <DialogContent className="sm:max-w-lg bg-white max-h-[90vh] overflow-y-auto" style={{ width: 'min(600px, 85vw)' }}>
          <DialogHeader>
            <DialogTitle className="text-gray-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-blue-600" />
                Create New Badge
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Full Name
              </Label>
              <Input
                id="name"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="Enter full name"
                className="bg-white text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                Department
              </Label>
              <Input
                id="department"
                value={createForm.department}
                onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                placeholder="Enter department"
                className="bg-white text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="Enter email address"
                className="bg-white text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companion" className="text-sm font-medium text-gray-700">
                Companion (Optional)
              </Label>
              <Input
                id="companion"
                value={createForm.companion}
                onChange={(e) => setCreateForm({ ...createForm, companion: e.target.value })}
                placeholder="Enter companion name"
                className="bg-white text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Badge Type
              </Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={createForm.type === 'Badge' ? 'default' : 'outline'}
                  onClick={() => setCreateForm({ ...createForm, type: 'Badge', days: [1, 2, 3, 4, 5] })}
                  className="flex-1"
                >
                  Regular Badge
                </Button>
                <Button
                  type="button"
                  variant={createForm.type === 'Multiday Badge' ? 'default' : 'outline'}
                  onClick={() => setCreateForm({ ...createForm, type: 'Multiday Badge', days: [1] })}
                  className="flex-1"
                >
                  Multiday Badge
                </Button>
              </div>
            </div>

            {createForm.type === 'Multiday Badge' && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Valid Days
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5].map((day) => (
                    <motion.div key={day} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="button"
                        variant={createForm.days.includes(day) ? "default" : "outline"}
                        onClick={() => {
                          if (createForm.days.includes(day)) {
                            // Remove day if already selected (but keep at least one)
                            if (createForm.days.length > 1) {
                              setCreateForm({ 
                                ...createForm, 
                                days: createForm.days.filter(d => d !== day) 
                              })
                            }
                          } else {
                            // Add day if not selected
                            setCreateForm({ 
                              ...createForm, 
                              days: [...createForm.days, day].sort() 
                            })
                          }
                        }}
                        className={`h-12 w-full ${
                          createForm.days.includes(day) 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Day {day}
                      </Button>
                    </motion.div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Select which days this badge will be valid for. At least one day must be selected.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleCreateBadge}
                disabled={isCreating || !createForm.name || !createForm.department || createForm.days.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isCreating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2 h-4 w-4 rounded-full border-2 border-blue-300 border-t-white"
                    />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Badge
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowCreateModal(false)
                  setCreateForm({
                    name: '',
                    department: '',
                    email: '',
                    type: 'Badge',
                    days: [1, 2, 3, 4, 5],
                    companion: ''
                  })
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Badge Modal */}
      <Dialog open={showEditModal} onOpenChange={() => setShowEditModal(false)}>
        <DialogContent className="sm:max-w-lg bg-white max-h-[90vh] overflow-y-auto" style={{ width: 'min(600px, 85vw)' }}>
          <DialogHeader>
            <DialogTitle className="text-gray-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-blue-600" />
                Edit Badge
              </div>
            </DialogTitle>
          </DialogHeader>

          {editForm && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Enter full name"
                  className="bg-white text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-department" className="text-sm font-medium text-gray-700">
                  Department
                </Label>
                <Input
                  id="edit-department"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  placeholder="Enter department"
                  className="bg-white text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="Enter email address"
                  className="bg-white text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-companion" className="text-sm font-medium text-gray-700">
                  Companion (Optional)
                </Label>
                <Input
                  id="edit-companion"
                  value={editForm.companion || ''}
                  onChange={(e) => setEditForm({ ...editForm, companion: e.target.value })}
                  placeholder="Enter companion name"
                  className="bg-white text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Badge Type
                </Label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={editForm.type === 'Badge' ? 'default' : 'outline'}
                    onClick={() => setEditForm({ ...editForm, type: 'Badge', days: [1, 2, 3, 4, 5] })}
                    className="flex-1"
                  >
                    Regular Badge
                  </Button>
                  <Button
                    type="button"
                    variant={editForm.type === 'Multiday Badge' ? 'default' : 'outline'}
                    onClick={() => setEditForm({ ...editForm, type: 'Multiday Badge', days: editForm.days.length === 5 ? [1] : editForm.days })}
                    className="flex-1"
                  >
                    Multiday Badge
                  </Button>
                </div>
              </div>

              {editForm.type === 'Multiday Badge' && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">
                    Valid Days
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[1, 2, 3, 4, 5].map((day) => (
                      <motion.div key={day} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="button"
                          variant={editForm.days.includes(day) ? "default" : "outline"}
                          onClick={() => {
                            if (editForm.days.includes(day)) {
                              // Remove day if already selected (but keep at least one)
                              if (editForm.days.length > 1) {
                                setEditForm({ 
                                  ...editForm, 
                                  days: editForm.days.filter(d => d !== day) 
                                })
                              }
                            } else {
                              // Add day if not selected
                              setEditForm({ 
                                ...editForm, 
                                days: [...editForm.days, day].sort() 
                              })
                            }
                          }}
                          className={`h-12 w-full ${
                            editForm.days.includes(day) 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Day {day}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Select which days this badge will be valid for. At least one day must be selected.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Badge ID
                </Label>
                <Input
                  value={editForm.badgeId}
                  disabled
                  className="bg-gray-100 text-gray-600"
                />
                <p className="text-xs text-gray-500">
                  Badge ID cannot be changed
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleUpdateBadge}
                  disabled={isUpdating || !editForm.name || !editForm.department || editForm.days.length === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isUpdating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2 h-4 w-4 rounded-full border-2 border-blue-300 border-t-white"
                      />
                      Updating...
                    </>
                  ) : (
                    <>
                      <BadgeCheck className="mr-2 h-4 w-4" />
                      Update Badge
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditForm(null)
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Email Confirmation Modal */}
      <Dialog open={showEmailModal} onOpenChange={() => setShowEmailModal(false)}>
        <DialogContent className="sm:max-w-lg bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900 flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Send Badge Emails
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              You are about to send badge barcode emails to {selectedBadgeIds.length} recipients.
            </div>

            <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
              <div className="text-sm font-medium text-gray-700 mb-2">Recipients:</div>
              <div className="space-y-2">
                {selectedBadgeIds.map(badgeId => {
                  const badge = badges.find(b => b.badgeId === badgeId)
                  return badge ? (
                    <div key={badgeId} className="flex items-center justify-between text-xs bg-white px-2 py-1 rounded">
                      <span className="font-mono">{badgeId}</span>
                      <span>{badge.name}</span>
                      <span className="text-blue-600">{badge.email}</span>
                    </div>
                  ) : null
                })}
              </div>
            </div>

            {emailResults && (
              <div className={`p-4 rounded-lg ${emailResults.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                {emailResults.success ? (
                  <div>
                    <div className="text-green-800 font-medium mb-2">✅ Email Results</div>
                    <div className="text-sm text-green-700 space-y-1">
                      <div>✅ Sent: {emailResults.summary?.sent || 0}</div>
                      {emailResults.summary?.failed > 0 && <div>❌ Failed: {emailResults.summary.failed}</div>}
                      {emailResults.summary?.noEmail > 0 && <div>⚠️ No email: {emailResults.summary.noEmail}</div>}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-red-800 font-medium mb-2">❌ Error</div>
                    <div className="text-sm text-red-700">{emailResults.error}</div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSendEmails}
                disabled={isEmailSending || selectedBadgeIds.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isEmailSending ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2 h-4 w-4 rounded-full border-2 border-blue-300 border-t-white"
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send {selectedBadgeIds.length} Emails
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowEmailModal(false)
                  setEmailResults(null)
                }}
                variant="outline"
                className="flex-1"
                disabled={isEmailSending}
              >
                {emailResults ? 'Close' : 'Cancel'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}