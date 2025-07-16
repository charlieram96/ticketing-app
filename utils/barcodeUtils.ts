import JsBarcode from 'jsbarcode'

/**
 * Build a *high‑resolution* CODE‑128 barcode PNG with a human‑readable label.
 *
 *  ▸ crisper / larger modules (MODULE_WIDTH)
 *  ▸ extra whitespace around both bars and text (PAD)
 *  ▸ bigger font & thicker white label (FONT_SIZE / LABEL_PAD)
 */
export const generateBarcodeDataURL = (value: string): string => {
  /* ─────────────────────────  SETTINGS  ─────────────────────────────── */
  const MODULE_WIDTH = 4          // px per narrow bar (was 3)
  const BARCODE_HEIGHT = 120      // px (was 80)
  const PAD = 0                  // outer padding around everything (was 6)
  const FONT_SIZE = 18            // px (was 12)
  const LABEL_PAD = 0             // white border around text for legibility
  /* ------------------------------------------------------------------- */

  /* 1 ▸ generate bare barcode on temporary canvas */
  const tmp = document.createElement('canvas')
  JsBarcode(tmp, value, {
    format: 'CODE128',
    width: MODULE_WIDTH,
    height: BARCODE_HEIGHT,
    displayValue: false,
    margin: 0,
  })

  const BAR_W = tmp.width
  const BAR_H = tmp.height

  /* 2 ▸ create final canvas large enough for barcode + label */
  const CANVAS_W = BAR_W + PAD * 2
  const CANVAS_H = BAR_H + FONT_SIZE + PAD * 3

  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_W
  canvas.height = CANVAS_H

  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false // keep edges sharp

  // white background ensures consistent rendering in PDF
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  /* 3 ▸ draw barcode */
  // Add white rectangle behind barcode, positioned 10px higher
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(PAD, PAD + 18, BAR_W, BAR_H)
  
  ctx.drawImage(tmp, PAD, PAD + 18) // 10px higher

  /* 4 ▸ draw human‑readable text */
  ctx.font = `bold ${FONT_SIZE}px Arial, sans-serif`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'right'

  const text = value
  const textX = CANVAS_W - PAD
  const textY = BAR_H + PAD * 2 - 1 // 25px higher
  const textW = ctx.measureText(text).width

  // white rectangle behind the label for contrast
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(
    textX - textW - LABEL_PAD - 5,
    textY - LABEL_PAD / 2 - 18, // 20px higher
    textW + LABEL_PAD * 2 + 10,
    FONT_SIZE + LABEL_PAD + 20,
  )
  // black text
  ctx.fillStyle = '#000000'

  // stretch text vertically
  ctx.save()
  ctx.transform(1, 0, 0, 1.5, 0, -8)
  ctx.fillText(text, textX, textY / 1.5)
  ctx.restore()

  /* 5 ▸ return as PNG data‑URI */
  return canvas.toDataURL('image/png')
}

/** Convenience helper – array of IDs to { id: dataURL } map */
export const generateBarcodeDataURLs = (
  tickets: string[],
): Record<string, string> =>
  Object.fromEntries(tickets.map((id) => [id, generateBarcodeDataURL(id)]))
