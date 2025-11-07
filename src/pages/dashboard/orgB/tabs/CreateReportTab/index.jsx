import { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';

import FormSelector from './FormSelector';
import LoadingIndicator from './LoadingIndicator';
import FormQuestionsPanel from './FormQuestionsPanel';
import { getSessionToken, stripUnsupportedChars, getBarangayNameFromSession } from './utils';
import { showErrorAlert, showSuccessAlert } from '@/services/alert';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const HEADER_IMAGE_URL = '/header.png';

const CreateReportTab = () => {
  const [selectedFormId, setSelectedFormId] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loadingFormData, setLoadingFormData] = useState(false);
  const [forms, setForms] = useState([]);
  const [loadingForms, setLoadingForms] = useState(false);

  // ================================
  // 🧩 Fetch all forms (once)
  // ================================
  useEffect(() => {
    const fetchForms = async () => {
      setLoadingForms(true);
      try {
        const token = getSessionToken();
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dynamic-forms`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result?.error?.message || 'Failed to load forms');
        setForms(result.data || []);
      } catch (err) {
        await showErrorAlert(`Failed to load forms: ${err.message || err}`);
      } finally {
        setLoadingForms(false);
      }
    };
    fetchForms();
  }, []);

  // ================================
  // 🧠 Load selected form content
  // ================================
  useEffect(() => {
    if (!selectedFormId) return;

    const loadForm = async () => {
      setLoadingFormData(true);
      setSelectedQuestions([]);
      setAnswers({});

      try {
        const token = getSessionToken();
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dynamic-forms`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result?.error?.message || 'Failed to fetch form data');

        const form = result.data?.find((f) => f.form_id === selectedFormId);
        if (!form?.form_content) {
          await showErrorAlert('Form is empty or corrupted.');
          return;
        }

        let parsed;
        try {
          parsed =
            typeof form.form_content === 'string'
              ? JSON.parse(form.form_content)
              : form.form_content;
        } catch (err) {
          console.error('❌ Failed to parse form_content:', err);
          parsed = [];
        }

        if (!Array.isArray(parsed)) {
          await showErrorAlert('Form structure is invalid.');
          return;
        }

        setSelectedQuestions(parsed);
      } catch (err) {
        await showErrorAlert(`Error loading form.\n\n${err.message || err}`);
      } finally {
        setLoadingFormData(false);
      }
    };

    loadForm();
  }, [selectedFormId]);

  // ================================
  // 💬 Answer handling
  // ================================
  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  // ================================
  // 📄 PDF + Upload
  // ================================
  const handleFormSubmit = async (formJSON) => {
    try {
      const form = forms.find((f) => f.form_id === selectedFormId);
      const formName = stripUnsupportedChars(form?.form_name || 'Form');

      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([600, 800]);
      const { width, height } = page.getSize();
      let y = height - 40;

      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Header Image
      try {
        const imgBytes = await fetch(HEADER_IMAGE_URL).then((res) => res.arrayBuffer());
        const img = await pdfDoc.embedPng(imgBytes);
        const imgWidth = 500;
        const imgHeight = 120;
        page.drawImage(img, {
          x: (width - imgWidth) / 2,
          y: y - imgHeight,
          width: imgWidth,
          height: imgHeight,
        });
        y -= imgHeight + 20;
      } catch {
        // ignore image load errors
      }

      // Barangay Name
      const barangayNameRaw = await getBarangayNameFromSession();
      if (barangayNameRaw) {
        const barangayName = stripUnsupportedChars(barangayNameRaw);
        page.drawText(barangayName, {
          x: 50,
          y,
          size: 14,
          font: fontBold,
          color: rgb(0, 0, 0),
        });
        y -= 30;
      }

      // Form Title
      page.drawText(`${formName} Submission`, {
        x: 50,
        y,
        size: 14,
        font: fontBold,
        color: rgb(0, 0, 0),
      });
      y -= 40;

      // ===============================
      // 🧩 Improved answer rendering (fixes [object Object])
      // ===============================
      Object.entries(formJSON.answers).forEach(([questionId, answer], index) => {
        const question = selectedQuestions.find((q) => q.id === questionId);
        const questionText = stripUnsupportedChars(question?.label || 'Unknown');

        if (y < 100) {
          page = pdfDoc.addPage([600, 800]);
          y = height - 50;
        }

        // Question title
        page.drawText(`${index + 1}. ${questionText}`, {
          x: 50,
          y,
          size: 12,
          font: fontBold,
          color: rgb(0.2, 0.2, 0.2),
        });
        y -= 18;

        // 🟡 Handle Excel/table questions properly
        if (question?.type === 'table' && question.config) {
          const { columns = [], rows = [] } = question.config;
          const tableData = answer ?? {};

          // Column headers
          const headers = columns.map((col) => col.label || '').join(' | ');
          page.drawText(headers, { x: 70, y, size: 10, font: fontBold, color: rgb(0, 0, 0) });
          y -= 14;

          // Each row of answers
          rows.forEach((row, rIndex) => {
            const rowAnswers = tableData?.[rIndex] || {};
            const cells = columns
              .map((col) => (rowAnswers[col.key] ? String(rowAnswers[col.key]) : ''))
              .join(' | ');
            const line = `${row.label || ''}: ${cells}`;

            page.drawText(line, {
              x: 70,
              y,
              size: 10,
              font: fontRegular,
              color: rgb(0, 0, 0),
            });
            y -= 14;

            if (y < 80) {
              page = pdfDoc.addPage([600, 800]);
              y = height - 50;
            }
          });

          y -= 10;
        } else {
          // Regular question types
          const answerText =
            typeof answer === 'object'
              ? JSON.stringify(answer)
              : Array.isArray(answer)
              ? answer.join(', ')
              : stripUnsupportedChars(answer ?? '');

          page.drawText(answerText, {
            x: 60,
            y,
            size: 12,
            font: fontRegular,
            color: rgb(0, 0, 0),
          });
          y -= 25;
        }
      });

      const pdfBytes = await pdfDoc.save();

      // Upload PDF
      const token = getSessionToken();
      const formData = new FormData();

      const session = JSON.parse(sessionStorage.getItem('session'));
      const userNameRaw =
        session?.user?.user_metadata?.full_name || session?.user?.email || 'Anonymous';
      const safeUserName = stripUnsupportedChars(userNameRaw).replace(/\s+/g, '_');
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

      const safeFileName = `${formName.replace(/\s+/g, '_')}${
        barangayNameRaw
          ? `_${stripUnsupportedChars(barangayNameRaw).replace(/\s+/g, '_')}`
          : ''
      }_${safeUserName}_submission.pdf`;

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
        let msg = 'An unknown error occurred.';
        switch (uploadRes.status) {
          case 409:
            msg = 'Report already sent.';
            break;
          case 401:
            msg = 'You are not logged in. Please log in and try again.';
            break;
          case 403:
            msg = 'You do not have permission to perform this action.';
            break;
          case 404:
            msg = 'The requested resource could not be found.';
            break;
          case 500:
            msg = 'The server encountered an error. Please try again later.';
            break;
        }
        throw new Error(msg);
      }

      await showSuccessAlert('Report submitted successfully.');
      setAnswers({});
    } catch (err) {
      await showErrorAlert(`Could not submit the report.\n\n${err.message || 'Unknown error.'}`);
    }
  };

  // ================================
  // 🧾 Render
  // ================================
  return (
    <Box sx={{ height: '100vh', p: 2 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
        📝 Create Report
      </Typography>

      <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }}>
        {loadingForms ? (
          <Typography textAlign="center">Loading forms...</Typography>
        ) : (
          <FormSelector
            forms={forms}
            selectedFormId={selectedFormId}
            onSelect={setSelectedFormId}
          />
        )}
      </Paper>

      {loadingFormData && <LoadingIndicator />}

      {!loadingFormData && selectedQuestions.length > 0 && (
        <FormQuestionsPanel
          selectedFormId={selectedFormId}
          selectedQuestions={selectedQuestions}
          answers={answers}
          onAnswerChange={handleAnswerChange}
          onSubmit={handleFormSubmit}
        />
      )}
    </Box>
  );
};

export default CreateReportTab;
