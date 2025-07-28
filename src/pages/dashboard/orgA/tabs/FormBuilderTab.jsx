import { useState } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { createClient } from '@supabase/supabase-js';

import FormQuestion from './models/FormQuestion';
import FormEditorControls from './formbuildercomponents/FormEditorControls';
import FormPreviewRenderer from './formbuildercomponents/FormPreviewRenderer';
import { handleSaveLayout } from './formbuildercomponents/FormSaveHandler';

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
  console.log("✅ ADD OPTION triggered for", id);
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
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        🛠️ Dynamic Form Builder
      </Typography>

      <TextField
        fullWidth
        label="Form Name"
        value={formName}
        onChange={(e) => setFormName(e.target.value)}
        sx={{ mb: 2 }}
      />

      <FormEditorControls
        onAddQuestion={addQuestion}
        previewMode={previewMode}
        setPreviewMode={setPreviewMode}
        onSave={handleSave}
      />

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
  );
};

export default FormBuilderTab;
