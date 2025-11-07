// src/services/generateReportPDF.js
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { showErrorAlert, showSuccessAlert } from '@/services/alert';

const HEADER_IMAGE_URL = '/header.png';
// === PDF Setup for Long Bond Paper (8.5 x 13 inches) ===
const PAGE_WIDTH = 600;  // ~8.3 inches
const PAGE_HEIGHT = 936; // 13 inches (for long bond)

/**
 * Generates and uploads a report PDF.
 */
export async function generateReportPDF({
  selectedQuestions = [],
  formJSON = { answers: {} },
  forms = [],
  selectedFormId,
  getSessionToken,
  getBarangayNameFromSession,
}) {
  const stripUnsupportedChars = (text) =>
    text?.toString().replace(/[^\x00-\x7F]/g, '') || '';

  try {
    const form = forms.find((f) => f.form_id === selectedFormId) || {};
    const formName = stripUnsupportedChars(form?.form_name || 'Form');

    const pdfDoc = await PDFDocument.create();
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // helpers to create page and coordinates
    const makePage = () => {
      const p = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      return {
        page: p,
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        y: PAGE_HEIGHT - 20,
        marginLeft: 40,   // tighter side margins
        marginRight: 40,
      };
    };

    let ctx = makePage();
    const newPage = () => (ctx = makePage());

    // draw header image if available
    try {
      const imgBytes = await fetch(HEADER_IMAGE_URL).then((r) => r.arrayBuffer());
      const img = await pdfDoc.embedPng(imgBytes);
      const maxWidth = 500;
      const scale = Math.min(maxWidth / img.width, 1);
      const scaledW = img.width * scale;
      const scaledH = img.height * scale;
      ctx.page.drawImage(img, {
        x: (ctx.width - scaledW) / 2,
        y: ctx.y - scaledH,
        width: scaledW,
        height: scaledH,
      });
      ctx.y -= scaledH + 4;
    } catch (e) {
      // ignore missing header image
    }

    // ============================
    // 🧾 RBI HEADER (Compact Layout)
    // ============================
    const centerX = ctx.width / 2;

    ctx.page.drawText('RBI Form (Revised 2023)', {
      x: ctx.marginLeft,
      y: ctx.y,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
    ctx.y -= 10;

    const title2 = 'MONITORING REPORT';
    const title2Width = fontBold.widthOfTextAtSize(title2, 11);
    ctx.page.drawText(title2, {
      x: centerX - title2Width / 2,
      y: ctx.y,
      size: 11,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
    ctx.y -= 11;

    const subText = 'for ______ Semester of CY _______';
    const subTextWidth = fontRegular.widthOfTextAtSize(subText, 9);
    ctx.page.drawText(subText, {
      x: centerX - subTextWidth / 2,
      y: ctx.y,
      size: 9,
      font: fontRegular,
      color: rgb(0, 0, 0),
    });
    ctx.y -= 16;

    // --- Render questions ---
    const answers = formJSON.answers || {};
    const ensureSpace = (needed) => {
      if (ctx.y - needed < 70) newPage();
    };

    // draw table helper
    const drawTable = ({ question }) => {
      const cfg = question.config || {};
      const rows = Array.isArray(cfg.rows) ? cfg.rows : [];
      const columns = Array.isArray(cfg.columns) ? cfg.columns : [];
      const indicatorLabel = cfg.rowHeaderLabel || 'INDICATORS';

      const startX = ctx.marginLeft;
      const tableWidth = ctx.width - ctx.marginLeft - ctx.marginRight;
      const indicatorWidth = Math.max(100, Math.floor(tableWidth * 0.22));
      const remainingWidth = tableWidth - indicatorWidth;
      const colCount = Math.max(1, columns.length);
      const colWidths = Array(colCount).fill(Math.floor(remainingWidth / colCount));
      const leftover = remainingWidth - colWidths.reduce((a, b) => a + b, 0);
      colWidths[colWidths.length - 1] += leftover;

      const baseFontSize = 9;
      const lineHeight = 10;
      const paddingY = 3;

      const wrapText = (text, maxWidth, font, size) => {
        const words = stripUnsupportedChars(text || '').split(' ');
        const lines = [];
        let current = '';
        for (const word of words) {
          const test = current ? `${current} ${word}` : word;
          if (font.widthOfTextAtSize(test, size) > maxWidth && current) {
            lines.push(current);
            current = word;
          } else current = test;
        }
        if (current) lines.push(current);
        return lines;
      };

      const drawHeader = (yTop) => {
        const headerHeight = lineHeight + paddingY * 2;
        ctx.page.drawRectangle({
          x: startX,
          y: yTop - headerHeight,
          width: tableWidth,
          height: headerHeight,
          color: rgb(0.94, 0.94, 0.94),
        });
        ctx.page.drawRectangle({
          x: startX,
          y: yTop - headerHeight,
          width: indicatorWidth,
          height: headerHeight,
          color: rgb(0.98, 0.98, 0.91),
        });

        ctx.page.drawText(indicatorLabel.toUpperCase(), {
          x: startX + 6,
          y: yTop - lineHeight - 2,
          size: baseFontSize,
          font: fontBold,
        });

        let x = startX + indicatorWidth;
        columns.forEach((col, i) => {
          const label = stripUnsupportedChars(col.label || '').toUpperCase();
          const textWidth = fontBold.widthOfTextAtSize(label, baseFontSize);
          ctx.page.drawText(label, {
            x: x + (colWidths[i] - textWidth) / 2,
            y: yTop - lineHeight - 2,
            size: baseFontSize,
            font: fontBold,
          });
          x += colWidths[i];
        });
        return headerHeight;
      };

      let y = ctx.y;

// 🧱 Draw the table title row first (full-width, no columns)
const drawTableTitleRow = (yTop, titleText) => {
  const titleHeight = 18;

  // Background box (no borders — we’ll draw them manually)
  ctx.page.drawRectangle({
    x: startX,
    y: yTop - titleHeight,
    width: tableWidth,
    height: titleHeight,
    color: rgb(0.96, 0.96, 0.96),
  });

  // Title text
  ctx.page.drawText(stripUnsupportedChars(titleText), {
    x: startX + 6,
    y: yTop - 13,
    size: baseFontSize + 1,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  // 🔹 Draw manual borders for the title row
  // Top border
  ctx.page.drawLine({
    start: { x: startX, y: yTop },
    end: { x: startX + tableWidth, y: yTop },
    thickness: 0.8,
    color: rgb(0, 0, 0),
  });

  // Left border
  ctx.page.drawLine({
    start: { x: startX, y: yTop },
    end: { x: startX, y: yTop - titleHeight },
    thickness: 0.8,
    color: rgb(0, 0, 0),
  });

  // Right border
  ctx.page.drawLine({
    start: { x: startX + tableWidth, y: yTop },
    end: { x: startX + tableWidth, y: yTop - titleHeight },
    thickness: 0.8,
    color: rgb(0, 0, 0),
  });

  // ✅ Bottom border (the one you actually want)
  ctx.page.drawLine({
    start: { x: startX, y: yTop - titleHeight },
    end: { x: startX + tableWidth, y: yTop - titleHeight },
    thickness: 1, // slightly bolder for separation
    color: rgb(0, 0, 0),
  });

  return titleHeight;
};


// 👇 draw the new title row, then header
const titleHeight = drawTableTitleRow(y, question.label || 'Untitled Table');
y -= titleHeight;

const headerHeight = drawHeader(y);
y -= headerHeight;

// ✅ Redraw bottom border of title row after header fill
// This ensures it sits above the header background, not under it
ctx.page.drawLine({
  start: { x: startX, y: y + headerHeight + 0.5 }, // +0.5 nudges it upward slightly
  end: { x: startX + tableWidth, y: y + headerHeight + 0.5 },
  thickness: 0.9,
  color: rgb(0, 0, 0),
});


      const tableData = answers[question.id] || [];

      for (let r = 0; r < rows.length; r++) {
        const rowObj = rows[r] || {};
        const indicatorText = stripUnsupportedChars(rowObj.label || '');
        const indicatorLines = wrapText(indicatorText, indicatorWidth - 10, fontRegular, baseFontSize);
        const cellLinesArray = columns.map((col) =>
          wrapText(tableData?.[r]?.[col.key] ?? '', colWidths[columns.indexOf(col)] - 8, fontRegular, baseFontSize)
        );
        const maxLines = Math.max(indicatorLines.length, ...cellLinesArray.map((l) => l.length));
        const rowHeight = paddingY * 2 + maxLines * lineHeight;

        if (y - rowHeight < 80) {
          drawTableBorder(startX, tableWidth, indicatorWidth, colWidths, ctx.y, y);
          newPage();
          y = ctx.y;
          drawHeader(y);
          y -= headerHeight;
        }

        let textY = y - paddingY - lineHeight;
        indicatorLines.forEach((line) => {
          ctx.page.drawText(line, {
            x: startX + 6,
            y: textY,
            size: baseFontSize,
            font: fontRegular,
          });
          textY -= lineHeight;
        });

        let cellX = startX + indicatorWidth;
        columns.forEach((col, i) => {
          const lines = cellLinesArray[i];
          let ty = y - paddingY - lineHeight;
          lines.forEach((line) => {
            ctx.page.drawText(line, {
              x: cellX + 4,
              y: ty,
              size: baseFontSize,
              font: fontRegular,
            });
            ty -= lineHeight;
          });
          cellX += colWidths[i];
        });

        ctx.page.drawLine({
          start: { x: startX, y: y - rowHeight },
          end: { x: startX + tableWidth, y: y - rowHeight },
          thickness: 0.6,
          color: rgb(0, 0, 0),
        });

        y -= rowHeight;
      }

      drawTableBorder(startX, tableWidth, indicatorWidth, colWidths, ctx.y, y);
      ctx.y = y - 15;

      function drawTableBorder(x, width, indicatorW, colWs, topY, bottomY) {
        ctx.page.drawRectangle({
          x,
          y: bottomY,
          width,
          height: topY - bottomY,
          borderColor: rgb(0, 0, 0),
          borderWidth: 0.8,
        });
        let vX = x + indicatorW;
        colWs.forEach((w) => {
         // stop vertical lines *below* the title row
ctx.page.drawLine({
  start: { x: vX, y: topY - 18 }, // 18 = title row height
  end: { x: vX, y: bottomY },
  thickness: 0.6,
  color: rgb(0, 0, 0),
});

          vX += w;
        });
      }
    };

   // render questions
for (const question of selectedQuestions) {
  if (question.type === 'footer') continue;

  // handle TABLE questions separately
  if (question.type === 'table') {
    drawTable({ question });
    continue;
  }

  // --- Non-table question ---
  ensureSpace(25);

  // Draw the question label
  ctx.page.drawText(stripUnsupportedChars(question.label || 'Untitled Question'), {
    x: ctx.marginLeft,
    y: ctx.y,
    size: 10,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  ctx.y -= 12;

  // Draw the answer (or dashed underline if empty)
  const answerVal = answers[question.id];
  const display = Array.isArray(answerVal)
    ? answerVal.join(', ')
    : stripUnsupportedChars(answerVal ?? '');

  if (display) {
    // Answered — draw text normally
    ensureSpace(18);
    ctx.page.drawText(display, {
      x: ctx.marginLeft + 10,
      y: ctx.y,
      size: 9.5,
      font: fontRegular,
      color: rgb(0, 0, 0),
    });
    ctx.y -= 16;
  } else {
    // Unanswered — draw faint dashed line
    const lineStartX = ctx.marginLeft + 10;
    const lineEndX = ctx.width - ctx.marginRight - 100;
    const lineY = ctx.y + 2;
    const dashLength = 6;
    const gap = 3;

    for (let x = lineStartX; x < lineEndX; x += dashLength + gap) {
      ctx.page.drawLine({
        start: { x, y: lineY },
        end: { x: Math.min(x + dashLength, lineEndX), y: lineY },
        thickness: 0.6,
        color: rgb(0.6, 0.6, 0.6),
      });
    }

    ctx.y -= 16; // vertical space after underline
  }
}
// ============================
// ✍️ FOOTER SECTION
// ============================
const footerQuestion = selectedQuestions.find((q) => q.type === 'footer');
if (footerQuestion && footerQuestion.config) {
  if (ctx.y < 220) newPage();

  const f = footerQuestion.config;
  const leftX = ctx.marginLeft + 10;
  const rightX = ctx.width - ctx.marginRight - 220;
  const sigLineWidth = 220;
  const footerBaseY = 100;
  const sigLineY = footerBaseY + 100;

  // Labels
  ctx.page.drawText(f.preparedByLabel || 'Prepared by', {
    x: leftX,
    y: sigLineY + 30,
    size: 10,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  ctx.page.drawText(f.submittedByLabel || 'Submitted by', {
    x: rightX,
    y: sigLineY + 30,
    size: 10,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  // Signature lines
  ctx.page.drawLine({
    start: { x: leftX, y: sigLineY },
    end: { x: leftX + sigLineWidth, y: sigLineY },
    thickness: 0.8,
    color: rgb(0, 0, 0),
  });
  ctx.page.drawLine({
    start: { x: rightX, y: sigLineY },
    end: { x: rightX + sigLineWidth, y: sigLineY },
    thickness: 0.8,
    color: rgb(0, 0, 0),
  });

  // Printed names
  const nameY = sigLineY - 25;
  ctx.page.drawText(f.preparedByRole || 'Barangay Secretary', {
    x: leftX,
    y: nameY,
    size: 9.5,
    font: fontRegular,
  });
  ctx.page.drawText(f.submittedByRole || 'Punong Barangay', {
    x: rightX,
    y: nameY,
    size: 9.5,
    font: fontRegular,
  });

  // Signature note
  ctx.page.drawText('(Signature over Printed Name)', {
    x: leftX,
    y: nameY - 12,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });
  ctx.page.drawText('(Signature over Printed Name)', {
    x: rightX,
    y: nameY - 12,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Date accomplished
  const dateY = footerBaseY - 4;
  ctx.page.drawText('Date Accomplished:', {
    x: leftX,
    y: dateY,
    size: 9.5,
    font: fontBold,
  });
  ctx.page.drawLine({
    start: { x: leftX + 110, y: dateY },
    end: { x: leftX + 260, y: dateY },
    thickness: 0.6,
    color: rgb(0, 0, 0),
  });

  // Footer note
  ctx.page.drawText(
    f.noteText ||
      'Note: This form is generated and submitted through the Report Management System.',
    {
      x: leftX,
      y: dateY - 16,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    }
  );
}

    // finalize pdf bytes
    const pdfBytes = await pdfDoc.save();

    // upload
    const token = (typeof getSessionToken === 'function' && getSessionToken()) || '';
    const formData = new FormData();
    const session = JSON.parse(sessionStorage.getItem('session') || '{}');
    const userNameRaw =
      session?.user?.user_metadata?.full_name || session?.user?.email || 'Anonymous';
    const safeUserName = stripUnsupportedChars(userNameRaw).replace(/\s+/g, '_');
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    const safeFileName = `${formName.replace(/\s+/g, '_')}_${safeUserName}_submission.pdf`;
    formData.append('file', pdfBlob, safeFileName);

    const uploadRes = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-report`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );

    if (!uploadRes.ok) {
      const txt = await uploadRes.text().catch(() => '');
      throw new Error(`Upload failed (${uploadRes.status}) ${txt}`);
    }

    showSuccessAlert('Report submitted successfully.');
    return true;
  } catch (err) {
    showErrorAlert(`Could not submit the report.\n\n${err.message || err}`);
    return false;
  }
}

export default generateReportPDF;
