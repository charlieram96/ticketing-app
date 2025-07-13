'use client'

import { Document, Page, View, Image, StyleSheet, pdf } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import { generateBarcodeDataURLs } from '@/utils/barcodeUtils'

interface TicketsPDFProps {
  tickets: string[]
  validDay: 'day1' | 'day2' | 'day3' | 'day4'
  barcodes: Record<string, string>
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    paddingTop: 20,
  },
  ticketGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ticketContainer: {
    width: 236.3,
    height: 157.65,
    marginBottom: 0,
    position: 'relative',
  },
  ticketImage: {
    position: 'absolute',
    objectFit: 'contain',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  barcode: {
    position: 'absolute',
    top: 69,
    left: -43.5,
    width: 135,
    height: 19,
    transform: 'rotate(90deg)',
  },
})

const TicketsPDFDocument = ({ tickets, validDay, barcodes }: TicketsPDFProps) => {
  const ticketsPerPage = 10
  const pages = Math.ceil(tickets.length / ticketsPerPage)

  return (
    <Document>
      {Array.from({ length: pages }, (_, pageIndex) => {
        const pageTickets = tickets.slice(
          pageIndex * ticketsPerPage,
          (pageIndex + 1) * ticketsPerPage
        )

        return (
          <Page key={pageIndex} size="A4" style={styles.page}>
            <View style={styles.ticketGrid}>
              {pageTickets.map((ticketId, idx) => (
                <View key={idx} style={styles.ticketContainer}>
                  <Image
                    src={`/${validDay}-ticket.png`}
                    style={styles.ticketImage}
                  />
                  <Image src={barcodes[ticketId]} style={styles.barcode} />
                </View>
              ))}
            </View>
          </Page>
        )
      })}
    </Document>
  )
}

export const generateTicketsPDF = async (
  tickets: string[],
  validDay: 'day1' | 'day2' | 'day3' | 'day4'
) => {
  const barcodes = generateBarcodeDataURLs(tickets)
  const blob = await pdf(
    <TicketsPDFDocument
      tickets={tickets}
      validDay={validDay}
      barcodes={barcodes}
    />
  ).toBlob()
  saveAs(blob, `tickets-${validDay}-${Date.now()}.pdf`)
}

export default TicketsPDFDocument
