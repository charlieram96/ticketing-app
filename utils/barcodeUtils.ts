import JsBarcode from 'jsbarcode'

export const generateBarcodeDataURL = (value: string): string => {
  const canvas = document.createElement('canvas')
  
  JsBarcode(canvas, value, {
    format: 'CODE128',
    width: 2,
    height: 120,
    displayValue: false,
    background: '#ffffff',
    lineColor: '#000000',
    margin: 0,
    fontSize: 14,
    textMargin: 0,
    flat: false
  })
  
  return canvas.toDataURL('image/png')
}

export const generateBarcodeDataURLs = (tickets: string[]): Record<string, string> => {
  const barcodes: Record<string, string> = {}
  
  tickets.forEach(ticket => {
    barcodes[ticket] = generateBarcodeDataURL(ticket)
  })
  
  return barcodes
}