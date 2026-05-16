/**
 * Shared print layout system.
 * All printable views use these constants and the buildPrintPage() wrapper
 * to ensure WYSIWYG preview-to-print accuracy.
 */

const URDU_FONT = "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Noto Naskh Arabic', serif"
const LATIN_FONT = "'Inter', 'Segoe UI', sans-serif"

// A4 dimensions in mm
const A4_W = 210
const A4_H = 297
// Convert mm to px at 96dpi (1mm ≈ 3.7795px)
const MM_TO_PX = 3.7795

/**
 * Shared base CSS injected into every print window.
 * Ensures consistent rendering between preview and actual print.
 */
export const BASE_PRINT_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #e8e8e8;
    font-family: ${LATIN_FONT};
    color: #1a1a2e;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── Toolbar (hidden on print) ── */
  .print-toolbar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: #1f222a;
    border-bottom: 2px solid #6c5ce7;
    padding: 10px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .print-toolbar-title {
    font-size: 14px;
    font-weight: 700;
    color: #e8ecf4;
  }
  .print-toolbar-sub {
    font-size: 11px;
    color: #a1a7b5;
    margin-top: 2px;
  }
  .print-toolbar-actions {
    display: flex;
    gap: 10px;
    flex-shrink: 0;
  }
  .print-toolbar .btn {
    padding: 8px 20px;
    border: none;
    border-radius: 7px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
  }
  .print-toolbar .btn-print {
    background: rgba(116,185,255,0.15);
    color: #74b9ff;
    border: 1px solid #74b9ff;
  }
  .print-toolbar .btn-print:hover { background: rgba(116,185,255,0.3); }
  .print-toolbar .btn-download {
    background: linear-gradient(135deg, #e74c3c, #c0392b);
    color: #fff;
    box-shadow: 0 3px 12px rgba(231,76,60,0.3);
  }
  .print-toolbar .btn-download:hover { opacity: 0.9; }
  .print-toolbar .btn-download:disabled { opacity: 0.5; cursor: not-allowed; }
  .print-toolbar .btn-close {
    background: #333;
    color: #ccc;
  }

  /* ── A4 Page Container ── */
  .print-page {
    width: ${A4_W}mm;
    min-height: ${A4_H}mm;
    margin: 20px auto;
    padding: 12mm;
    background: #fff;
    box-shadow: 0 2px 20px rgba(0,0,0,0.15);
    overflow: hidden;
  }

  /* ── Tables ── */
  .print-page table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  .print-page th, .print-page td {
    border: 1px solid #333;
    padding: 6px 8px;
    font-size: 11px;
    vertical-align: middle;
    word-break: break-word;
    overflow-wrap: break-word;
  }
  .print-page th {
    background: #6c5ce7;
    color: #fff;
    font-weight: 700;
    font-size: 10px;
    text-transform: uppercase;
  }
  .print-page tr:nth-child(even) td { background: #f8f8fc; }

  /* ── Print media ── */
  @media print {
    body { background: #fff !important; }
    .print-toolbar { display: none !important; }
    .print-page {
      width: 100%;
      min-height: auto;
      margin: 0;
      padding: 0;
      box-shadow: none;
    }
    tr { page-break-inside: avoid; break-inside: avoid; }
    thead { display: table-header-group; }
    th, tr:nth-child(even) td {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
`

/**
 * Builds a complete print-ready HTML page.
 *
 * @param {Object} opts
 * @param {string} opts.title        - Window/tab title
 * @param {string} opts.bodyContent  - The HTML to render inside the A4 page
 * @param {string} opts.orientation  - 'portrait' | 'landscape'
 * @param {string} opts.pageMargin   - CSS margin for @page rule (e.g. '10mm' or '2.5in 0.5in 0.5in 1.5in')
 * @param {string} opts.extraCss     - Additional CSS appended after base styles
 * @param {string} opts.toolbarTitle - Text shown in the toolbar
 * @param {string} opts.toolbarSub   - Subtitle in toolbar
 * @param {boolean} opts.showDownload - Show download PDF button
 * @param {string} opts.lang         - HTML lang attribute
 * @param {string} opts.dir          - HTML dir attribute (rtl/ltr)
 * @returns {string} Complete HTML document string
 */
export function buildPrintPage({
  title = 'Print Preview',
  bodyContent = '',
  orientation = 'portrait',
  pageMargin = '10mm',
  extraCss = '',
  toolbarTitle = '📄 Print Preview',
  toolbarSub = '',
  showDownload = false,
  lang = 'ur',
  dir = 'rtl',
}) {
  const pageWidth = orientation === 'landscape' ? `${A4_H}mm` : `${A4_W}mm`
  const pageMinHeight = orientation === 'landscape' ? `${A4_W}mm` : `${A4_H}mm`

  const downloadBtn = showDownload
    ? `<button class="btn btn-download" id="btnDownload">📥 Download PDF</button>`
    : ''

  const downloadScript = showDownload
    ? `document.getElementById('btnDownload').addEventListener('click', function() {
        this.disabled = true; this.textContent = '⏳ Generating…';
        window.opener && window.opener.postMessage({ type: 'DOWNLOAD_PDF' }, '*');
        setTimeout(() => { this.disabled = false; this.textContent = '📥 Download PDF'; }, 5000);
      });`
    : ''

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    ${BASE_PRINT_CSS}

    /* Override page dimensions for this specific print */
    @page { size: A4 ${orientation}; margin: ${pageMargin}; }
    .print-page {
      width: ${pageWidth};
      min-height: ${pageMinHeight};
    }

    ${extraCss}
  </style>
</head>
<body>
  <div class="print-toolbar">
    <div>
      <div class="print-toolbar-title">${toolbarTitle}</div>
      ${toolbarSub ? `<div class="print-toolbar-sub">${toolbarSub}</div>` : ''}
    </div>
    <div class="print-toolbar-actions">
      <button class="btn btn-print" onclick="window.print()">🖨️ Print</button>
      ${downloadBtn}
      <button class="btn btn-close" onclick="window.close()">✕ Close</button>
    </div>
  </div>
  <div class="print-page">
    ${bodyContent}
  </div>
  <script>
    ${downloadScript}
    document.fonts.ready.then(() => { /* fonts loaded */ });
  </script>
</body>
</html>`
}

export { URDU_FONT, LATIN_FONT, A4_W, A4_H, MM_TO_PX }
