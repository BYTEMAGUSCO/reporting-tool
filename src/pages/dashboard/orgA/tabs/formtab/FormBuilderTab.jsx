import { useState } from 'react';
import { Box, TextField, Typography, Paper, Divider } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import { createClient } from '@supabase/supabase-js';

import FormQuestion from '../models/FormQuestion';
import FormEditorControls from './formbuildercomponents/FormEditorControls';
import FormPreviewRenderer from './formbuildercomponents/FormPreviewRenderer';
import { handleSaveLayout } from './formbuildercomponents/FormSaveHandler';
import { showSuccessAlert, showErrorAlert } from '@/services/alert.js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function getSessionToken() {
  return JSON.parse(sessionStorage.getItem('session'))?.access_token ?? '';
}

const FormBuilderTab = () => {
  const [questions, setQuestions] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [formName, setFormName] = useState('');
  const [saving, setSaving] = useState(false);

  const addQuestion = () => {
    const newQ = new FormQuestion();
    setQuestions([...questions, newQ]);
  };

  const deleteQuestion = (id) =>
    setQuestions(questions.filter((q) => q.id !== id));

  const updateQuestion = (id, key, value) =>
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const instance = FormQuestion.fromJSON(q);
          instance.updateField(key, value);
          return instance;
        }
        return q;
      })
    );

  const addOption = (id) => {
    const updated = questions.map((q) => {
      if (q.id === id) {
        const instance = FormQuestion.fromJSON(q);
        instance.addOption();
        return instance;
      }
      return q;
    });
    setQuestions(updated);
  };

  const updateOption = (id, idx, value) =>
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const instance = FormQuestion.fromJSON(q);
          instance.updateOption(idx, value);
          return instance;
        }
        return q;
      })
    );

  const removeOption = (id, index) =>
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const instance = FormQuestion.fromJSON(q);
          instance.removeOption(index);
          return instance;
        }
        return q;
      })
    );

  const handleSave = async () => {
    setSaving(true);
    const success = await handleSaveLayout(
      formName,
      questions,
      getSessionToken(),
      import.meta.env.VITE_SUPABASE_URL
    );

    if (success) {
      setFormName('');
      setQuestions([]);
    }
    setSaving(false);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 0 }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <BuildIcon /> Dynamic Form Builder
        </Typography>
      </Box>

      {/* Top Form Controls */}
      <Paper elevation={2} sx={{ borderRadius: 2, p: 2, mb: 0 }}>
        <TextField
          fullWidth
          label="Form Name"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          sx={{ mb: 1 }}
        />
        <FormEditorControls
          onAddQuestion={addQuestion}
          previewMode={previewMode}
          setPreviewMode={setPreviewMode}
          onSave={handleSave}
          saving={saving}
        />
      </Paper>

      <Divider sx={{ mb: 0 }} />

      {/* Main Form Preview Area */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          backgroundColor: '#f9fafb',
          p: 3,
          borderRadius: 2,
        }}
      >
        <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
          <FormPreviewRenderer
            questions={questions}
            previewMode={previewMode}
            deleteQuestion={deleteQuestion}
            updateQuestion={updateQuestion}
            updateOption={updateOption}
            addOption={addOption}
            removeOption={removeOption}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default FormBuilderTab;
