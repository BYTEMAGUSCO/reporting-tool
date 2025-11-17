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
import { generateReportPDF } from '@/services/generateReportPDF';
function getSessionToken() {
  return JSON.parse(sessionStorage.getItem('session'))?.access_token ?? '';
}

const HEADER_IMAGE_URL = '/header.png';

const FormFillerTab = () => {
  const [selectedFormId, setSelectedFormId] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loadingFormData, setLoadingFormData] = useState(false);

 const [forms, setForms] = useState([]);
const [loading, setLoading] = useState(true);
useEffect(() => {
  const fetchAllVisibleForms = async () => {
    setLoading(true);
    try {
      const token = getSessionToken();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dynamic-forms?limit=9999`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result?.error?.message || 'Failed to fetch forms');

      const visibleForms = result.data?.filter((f) =>
        f.is_visible === true ||
        f.is_visible === 'Y' ||
        f.is_visible === 'y' ||
        f.is_visible === 1
      ) || [];

      setForms(visibleForms);
    } catch (err) {
      console.error('Failed to fetch forms:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchAllVisibleForms();
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
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dynamic-forms`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result?.error?.message || 'Failed to fetch form data');

      const form = result.data?.find((f) => f.form_id === formId);
      if (!form?.form_content) {
        showErrorAlert('Form is empty or corrupted.');
        return;
      }

      const parsed =
        typeof form.form_content === 'string'
          ? JSON.parse(form.form_content)
          : form.form_content;

      if (!Array.isArray(parsed)) {
        showErrorAlert('Form structure is invalid.');
        return;
      }

      setSelectedQuestions(parsed);
    } catch (err) {
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
  const getBarangayNameFromSession = async () => {
    try {
      const session = JSON.parse(sessionStorage.getItem('session'));
      const barangayId = session?.user?.user_metadata?.barangay;
      if (!barangayId) return '';
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/barangays`);
      const barangayList = await res.json();
      const match = barangayList.find((b) => b.id === barangayId);
      return match ? `${match.name} (District ${match.district_number})` : '';
    } catch {
      return '';
    }
  };

  await generateReportPDF({
    selectedQuestions,
    formJSON,
    answers,              // ❤️ also include answers!
    form_id: selectedFormId,   // ⭐ ADD THIS
    forms,
    selectedFormId,
    getSessionToken,
    getBarangayNameFromSession,
  });
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
