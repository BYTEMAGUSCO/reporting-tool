import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { showErrorAlert, showSuccessAlert } from '@/services/alert';

const HEADER_IMAGE_URL = '/header.png';

// === PDF Setup for Long Bond Paper (8.5 x 13 inches) ===
const PAGE_WIDTH = 600; // ~8.3 inches
const PAGE_HEIGHT = 936; // 13 inches (long bond)

/**
 * Generates and uploads a report PDF dynamically (no hardcoded text).
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
    // === FORM DATA ===
    const form = forms.find((f) => f.form_id === selectedFormId) || {};
    const formName = stripUnsupportedChars(form?.form_name || 'Untitled Form');

    const pdfDoc = await PDFDocument.create();
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // === PAGE CREATION ===
    const makePage = () => {
      const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      return {
        page,
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        y: PAGE_HEIGHT - 20,
        marginLeft: 40,
        marginRight: 40,
      };
    };

    const barangayRaw =
      (typeof getBarangayNameFromSession === 'function' &&
        (await getBarangayNameFromSession())) ||
      'Barangay';

    const safeBarangay = stripUnsupportedChars(barangayRaw).replace(/\s+/g, '_');
    let ctx = makePage();
    const newPage = () => (ctx = makePage());

    // === HEADER IMAGE ===
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
      // skip header if missing
    }



    // === HELPERS ===
    const answers = formJSON.answers || {};
    const ensureSpace = (needed) => {
      if (ctx.y - needed < 70) newPage();
    };

    // === WRAP TEXT ===
    const wrapText = (text, maxWidth, font, size) => {
      const cleanText = stripUnsupportedChars(text || '');
      const words = cleanText.split(' ');
      const lines = [];
      let currentLine = '';

      for (const word of words) {
        if (font.widthOfTextAtSize(word, size) > maxWidth) {
          let chunk = '';
          for (const ch of word) {
            if (font.widthOfTextAtSize(chunk + ch, size) > maxWidth) {
              lines.push(chunk);
              chunk = ch;
            } else chunk += ch;
          }
          if (chunk) {
            if (currentLine) {
              const testLine = `${currentLine} ${chunk}`;
              if (font.widthOfTextAtSize(testLine, size) <= maxWidth) {
                currentLine = testLine;
              } else {
                lines.push(currentLine);
                currentLine = chunk;
              }
            } else lines.push(chunk);
          }
        } else {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          if (font.widthOfTextAtSize(testLine, size) > maxWidth) {
            lines.push(currentLine);
            currentLine = word;
          } else currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
      return lines;
    };

    // === TABLE DRAW FUNCTION ===
    const drawTable = ({ question }) => {
      const cfg = question.config || {};
      const rows = Array.isArray(cfg.rows) ? cfg.rows : [];
      const columns = Array.isArray(cfg.columns) ? cfg.columns : [];
      const indicatorLabel = cfg.rowHeaderLabel || 'Indicators';

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
      let y = ctx.y;

      const drawHeader = (yTop) => {
        const indicatorLines = wrapText(
          indicatorLabel.toUpperCase(),
          indicatorWidth - 10,
          fontBold,
          baseFontSize
        );
        const indicatorHeight = indicatorLines.length * lineHeight + paddingY * 2;

        const colHeaderHeights = columns.map((col, i) => {
          const lines = wrapText(col.label || '', colWidths[i] - 8, fontBold, baseFontSize);
          return lines.length * lineHeight + paddingY * 2;
        });
        const headerHeight = Math.max(indicatorHeight, ...colHeaderHeights);

        // background
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

        // indicator header text
        let indicatorY =
          yTop - (headerHeight - indicatorLines.length * lineHeight) / 2 - lineHeight / 2;
        indicatorLines.forEach((line) => {
          ctx.page.drawText(line, {
            x: startX + 6,
            y: indicatorY,
            size: baseFontSize,
            font: fontBold,
            color: rgb(0, 0, 0),
          });
          indicatorY -= lineHeight;
        });

        // column header texts
        let x = startX + indicatorWidth;
        columns.forEach((col, i) => {
          const label = stripUnsupportedChars(col.label || '').toUpperCase();
          const lines = wrapText(label, colWidths[i] - 8, fontBold, baseFontSize);
          let textY =
            yTop - (headerHeight - lines.length * lineHeight) / 2 - lineHeight / 2;
          lines.forEach((line) => {
            const textWidth = fontBold.widthOfTextAtSize(line, baseFontSize);
            ctx.page.drawText(line, {
              x: x + (colWidths[i] - textWidth) / 2,
              y: textY,
              size: baseFontSize,
              font: fontBold,
              color: rgb(0, 0, 0),
            });
            textY -= lineHeight;
          });
          x += colWidths[i];
        });

        // ✅ vertical divider lines for header
        let hx = startX;
        ctx.page.drawLine({
          start: { x: hx, y: yTop },
          end: { x: hx, y: yTop - headerHeight },
          thickness: 0.8,
          color: rgb(0, 0, 0),
        });
        hx += indicatorWidth;
        for (let i = 0; i < colWidths.length; i++) {
          ctx.page.drawLine({
            start: { x: hx, y: yTop },
            end: { x: hx, y: yTop - headerHeight },
            thickness: 0.8,
            color: rgb(0, 0, 0),
          });
          hx += colWidths[i];
        }

        // bottom header border
        ctx.page.drawLine({
          start: { x: startX, y: yTop - headerHeight },
          end: { x: startX + tableWidth, y: yTop - headerHeight },
          thickness: 0.8,
          color: rgb(0, 0, 0),
        });

        return headerHeight;
      };

      const drawTableTitleRow = (yTop, titleText) => {
        const titleHeight = 18;
        ctx.page.drawRectangle({
          x: startX,
          y: yTop - titleHeight,
          width: tableWidth,
          height: titleHeight,
          color: rgb(0.96, 0.96, 0.96),
        });
        ctx.page.drawText(stripUnsupportedChars(titleText || ''), {
          x: startX + 6,
          y: yTop - 13,
          size: baseFontSize + 1,
          font: fontBold,
        });
        ctx.page.drawLine({
          start: { x: startX, y: yTop - titleHeight },
          end: { x: startX + tableWidth, y: yTop - titleHeight },
          thickness: 0.8,
          color: rgb(0, 0, 0),
        });
        return titleHeight;
      };

      // draw title and header
      const titleHeight = drawTableTitleRow(y, question.label || 'Table');
      y -= titleHeight;
      const headerHeight = drawHeader(y);
      y -= headerHeight;

      // draw table rows
      const tableData = answers[question.id] || [];
      for (let r = 0; r < rows.length; r++) {
        const rowObj = rows[r] || {};
        const indicatorText = stripUnsupportedChars(rowObj.label || '');
        const indicatorLines = wrapText(
          indicatorText,
          indicatorWidth - 10,
          fontRegular,
          baseFontSize
        );
        const cellLinesArray = columns.map((col) =>
          wrapText(
            tableData?.[r]?.[col.key] ?? '',
            colWidths[columns.indexOf(col)] - 8,
            fontRegular,
            baseFontSize
          )
        );
        const maxLines = Math.max(
          indicatorLines.length,
          ...cellLinesArray.map((l) => l.length)
        );
        const rowHeight = paddingY * 2 + maxLines * lineHeight;

        if (y - rowHeight < 80) {
          newPage();
          y = ctx.y;
          drawHeader(y);
          y -= headerHeight;
        }

        // draw indicator + cells
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

        // ✅ horizontal line under row
        ctx.page.drawLine({
          start: { x: startX, y: y - rowHeight },
          end: { x: startX + tableWidth, y: y - rowHeight },
          thickness: 0.6,
          color: rgb(0, 0, 0),
        });

        // ✅ vertical dividers for each column
        let vx = startX;
        ctx.page.drawLine({
          start: { x: vx, y: y },
          end: { x: vx, y: y - rowHeight },
          thickness: 0.6,
          color: rgb(0, 0, 0),
        });
        vx += indicatorWidth;
        for (let i = 0; i < colWidths.length; i++) {
          ctx.page.drawLine({
            start: { x: vx, y: y },
            end: { x: vx, y: y - rowHeight },
            thickness: 0.6,
            color: rgb(0, 0, 0),
          });
          vx += colWidths[i];
        }

        y -= rowHeight;
      }

      ctx.y = y - 15;
    };

    // === RENDER QUESTIONS ===
    for (const question of selectedQuestions) {
      if (question.type === 'footer') continue;
      if (question.type === 'table') {
        drawTable({ question });
        continue;
      }
if (question.type === 'text_block') {
  let rawText = question.config?.text || '';

  // 🔥 strip all non-ASCII
  const text = stripUnsupportedChars(rawText);

  const align = question.config?.alignment || 'left';
  const fontSize = 10;

  // 🔥 support MULTILINE text_block
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    ensureSpace(20);

    let textWidth = fontRegular.widthOfTextAtSize(line, fontSize);
    let x = ctx.marginLeft;

    if (align === 'center') {
      x = ctx.width / 2 - textWidth / 2;
    } else if (align === 'right') {
      x = ctx.width - ctx.marginRight - textWidth;
    }

    ctx.page.drawText(line, {
      x,
      y: ctx.y,
      size: fontSize,
      font: fontRegular,
      color: rgb(0, 0, 0),
    });

    ctx.y -= 16;
  }

  continue;
}
// =====================================================
// ⭐ NORMAL QUESTION — SIDE-BY-SIDE (dynamic spacing)
// =====================================================

ensureSpace(25);

// Question label
const label = stripUnsupportedChars(question.label || 'Untitled Question');
const fontSizeLabel = 10;
const fontSizeAnswer = 9.5;

const labelX = ctx.marginLeft;
const yPos = ctx.y;

// Measure label width
const labelWidth = fontBold.widthOfTextAtSize(label, fontSizeLabel);

// HORRAY — dynamic answer position!
const answerX = labelX + labelWidth + 12; // 12px spacing between Q and A

// Draw label
ctx.page.drawText(label, {
  x: labelX,
  y: yPos,
  size: fontSizeLabel,
  font: fontBold,
});

// Get answer
const answerVal = answers[question.id];
const display = Array.isArray(answerVal)
  ? answerVal.join(', ')
  : stripUnsupportedChars(answerVal ?? '');

// Draw answer OR underline
if (display) {
  ctx.page.drawText(display, {
    x: answerX,
    y: yPos,
    size: fontSizeAnswer,
    font: fontRegular,
  });
} else {
  const lineEndX = ctx.width - ctx.marginRight - 40;
  const underlineY = yPos + 2;
  const dashLength = 6;
  const gap = 3;

  for (let x = answerX; x < lineEndX; x += dashLength + gap) {
    ctx.page.drawLine({
      start: { x, y: underlineY },
      end: { x: Math.min(x + dashLength, lineEndX), y: underlineY },
      thickness: 0.6,
      color: rgb(0.6, 0.6, 0.6),
    });
  }
}

ctx.y -= 16;

    }

    // === FOOTER ===
    const footerQuestion = selectedQuestions.find((q) => q.type === 'footer');
    if (footerQuestion && footerQuestion.config) {
      if (ctx.y < 220) newPage();

      const f = footerQuestion.config;
      const leftX = ctx.marginLeft + 10;
      const rightX = ctx.width - ctx.marginRight - 220;
      const sigLineWidth = 220;
      const sigLineY = 200;

      ctx.page.drawText(f.preparedByLabel || 'Prepared by', {
        x: leftX,
        y: sigLineY + 30,
        size: 10,
        font: fontBold,
      });
      ctx.page.drawText(f.submittedByLabel || 'Submitted by', {
        x: rightX,
        y: sigLineY + 30,
        size: 10,
        font: fontBold,
      });

      // signature lines
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

      // footer note
      ctx.page.drawText(
        f.noteText ||
          'Note: This form is generated and submitted through the Report Management System.',
        {
          x: leftX,
          y: 120,
          size: 8.5,
          font: fontRegular,
          color: rgb(0.3, 0.3, 0.3),
        }
      );
    }

    // === SAVE & UPLOAD ===
    const pdfBytes = await pdfDoc.save();
    const token = (typeof getSessionToken === 'function' && getSessionToken()) || '';
    const session = JSON.parse(sessionStorage.getItem('session') || '{}');
    const userNameRaw =
      session?.user?.user_metadata?.full_name || session?.user?.email || 'Anonymous';
    const safeUserName = stripUnsupportedChars(userNameRaw).replace(/\s+/g, '_');
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    const safeFileName = `${safeBarangay}_${formName.replace(/\s+/g, '_')}_${safeUserName}_submission.pdf`;

 const formData = new FormData();
formData.append('file', pdfBlob, safeFileName);

// ⭐ NEW: send form_id to backend
formData.append('form_id', selectedFormId);

// Optional: send answers if you want
// formData.append('answers', JSON.stringify(answers));

const uploadRes = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-report`,
  {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  }
);


    if (!uploadRes.ok) throw new Error('Upload failed.');
    await showSuccessAlert('Report submitted successfully.');
    return true;
  } catch (err) {
    await showErrorAlert(`Could not submit the report.\n\n${err.message || err}`);
    return false;
  }
}

export default generateReportPDF;
