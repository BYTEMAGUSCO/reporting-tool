import { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';

import FormSelector from './FormSelector';
import LoadingIndicator from './LoadingIndicator';
import FormQuestionsPanel from './FormQuestionsPanel';
import { getSessionToken, getBarangayNameFromSession } from './utils';
import { showErrorAlert } from '@/services/alert';
import generateReportPDF from '@/services/generateReportPDF'; // ✅ use the centralized generator

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
  // 📄 PDF + Upload via service
  // ================================
 const handleFormSubmit = async (formJSON) => {
  await generateReportPDF({
    selectedQuestions,
    formJSON,
    answers,                 // ⭐ ADD THIS
    form_id: selectedFormId, // ⭐ OPTIONAL: send as form_id for clarity
    selectedFormId,          // still sending for backward compat
    forms,
    getSessionToken,
    getBarangayNameFromSession,
  });
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
          onSubmit={handleFormSubmit} // ✅ uses the central PDF service
        />
      )}
    </Box>
  );
};

export default CreateReportTab;
