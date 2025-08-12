import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Paper,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';

import FormPreviewRenderer from './formbuildercomponents/FormPreviewRenderer';
import useFormsFetcher from './manageformtabcomponents/useFormsFetcher';
import { showErrorAlert, showSuccessAlert } from '@/services/alert';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

function getSessionToken() {
  return JSON.parse(sessionStorage.getItem('session'))?.access_token ?? '';
}

const HEADER_IMAGE_URL = '/header.png';

const FormFillerTab = () => {
  const [selectedFormId, setSelectedFormId] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loadingFormData, setLoadingFormData] = useState(false);

  const { forms, loading, fetchForms } = useFormsFetcher(1);

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    if (selectedFormId) {
      loadForm(selectedFormId);
    }
  }, [selectedFormId]);

  const loadForm = async (formId) => {
    setLoadingFormData(true);
    setSelectedQuestions([]);
    setAnswers({});

    try {
      const token = getSessionToken();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dynamic-forms`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result?.error?.message || 'Failed to fetch form data');

      const form = result.data?.find((f) => f.form_id === formId);
      if (!form?.form_content) {
        showErrorAlert('Form is empty or corrupted.');
        return;
      }

      const parsed = Array.isArray(form.form_content)
        ? form.form_content
        : JSON.parse(form.form_content);

      if (!Array.isArray(parsed)) {
        showErrorAlert('Form structure is invalid.');
        return;
      }

      setSelectedQuestions(parsed);
    } catch (err) {
      // console.error('Error loading form:', err);
      showErrorAlert(`Something went wrong while loading the form.\n\n${err.message || err}`);
    } finally {
      setLoadingFormData(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

 const handleFormSubmit = async (formJSON) => {
  const stripUnsupportedChars = (text) =>
    text?.toString().replace(/[^\x00-\x7F]/g, '') || '';

  // Helper to fetch barangay name from session
  const getBarangayNameFromSession = async () => {
    try {
      const session = JSON.parse(sessionStorage.getItem('session'));
      const barangayId = session?.user?.user_metadata?.barangay;
      if (!barangayId) return '';

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/barangays`
      );
      const barangayList = await res.json();

      const match = barangayList.find((b) => b.id === barangayId);
      return match ? `${match.name} (District ${match.district_number})` : '';
    } catch (err) {
      console.error('Failed to get barangay name:', err);
      return '';
    }
  };

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
      const imgHeight = 100;
      page.drawImage(img, {
        x: (width - imgWidth) / 2,
        y: y - imgHeight,
        width: imgWidth,
        height: imgHeight,
      });
      y -= imgHeight + 20;
    } catch (imgErr) {
      console.warn('Failed to load header image:', imgErr);
    }

    // Barangay Name (if available)
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

    // Form Data
    Object.entries(formJSON.answers).forEach(([questionId, answer], index) => {
      const question = selectedQuestions.find((q) => q.id === questionId);
      const questionText = stripUnsupportedChars(question?.label || 'Unknown');
      const answerText = stripUnsupportedChars(answer);

      if (y < 80) {
        page = pdfDoc.addPage([600, 800]);
        y = height - 50;
      }

      page.drawText(`${index + 1}. ${questionText}`, {
        x: 50,
        y,
        size: 12,
        font: fontBold,
        color: rgb(0.2, 0.2, 0.2),
      });
      y -= 18;

      page.drawText(answerText, {
        x: 60,
        y,
        size: 12,
        font: fontRegular,
        color: rgb(0, 0, 0),
      });
      y -= 25;
    });

    const pdfBytes = await pdfDoc.save();

    // Upload PDF
    const token = getSessionToken();
    const formData = new FormData();
    const session = JSON.parse(sessionStorage.getItem('session'));
const userNameRaw = session?.user?.user_metadata?.full_name || session?.user?.email || 'Anonymous';
const safeUserName = stripUnsupportedChars(userNameRaw).replace(/\s+/g, '_');
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
   const safeFileName = `${formName.replace(/\s+/g, '_')}${
  barangayNameRaw ? `_${stripUnsupportedChars(barangayNameRaw).replace(/\s+/g, '_')}` : ''
}_${safeUserName}_submission.pdf`;
    formData.append('file', pdfBlob, safeFileName);

    console.log('[Uploading PDF with filename]:', safeFileName);

    const uploadRes = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-report`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!uploadRes.ok) {
      let friendlyMessage = 'An unknown error occurred.';
      switch (uploadRes.status) {
        case 409:
          friendlyMessage = 'Report already sent.';
          break;
        case 401:
          friendlyMessage = 'You are not logged in. Please log in and try again.';
          break;
        case 403:
          friendlyMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          friendlyMessage = 'The requested resource could not be found.';
          break;
        case 500:
          friendlyMessage = 'The server encountered an error. Please try again later.';
          break;
      }
      throw new Error(friendlyMessage);
    }

    showSuccessAlert('Report submitted successfully.');
    setAnswers({});
  } catch (err) {
    showErrorAlert(`Could not submit the report.\n\n${err.message || 'An unknown error occurred.'}`);
  }
};


  return (
    <Box sx={{ height: '100vh', p: 2 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
        Fill a Form
      </Typography>

      <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Select a Form</InputLabel>
          <Select
            value={selectedFormId || ''}
            onChange={(e) => setSelectedFormId(e.target.value)}
            label="Select a Form"
          >
            <MenuItem disabled value="">
              -- Select a Form --
            </MenuItem>
            {forms.map((form) => (
              <MenuItem key={form.form_id} value={form.form_id}>
                {form.form_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {loadingFormData && (
        <Box display="flex" justifyContent="center" mt={2}>
          <CircularProgress />
        </Box>
      )}

      {!loadingFormData && selectedQuestions.length > 0 && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Answer the Questions:
          </Typography>

          <FormPreviewRenderer
            key={selectedFormId}
            questions={selectedQuestions}
            mode="submit"
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onSubmit={handleFormSubmit}
          />
        </Paper>
      )}
    </Box>
  );
};

export default FormFillerTab;
