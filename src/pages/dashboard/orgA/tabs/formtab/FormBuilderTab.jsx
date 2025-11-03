import { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Divider,
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import FormQuestion from '../models/FormQuestion';
import FormEditorControls from './formbuildercomponents/FormEditorControls';
import FormPreviewRenderer from './formbuildercomponents/FormPreviewRenderer';
import { handleSaveLayout } from './formbuildercomponents/FormSaveHandler';
import { showSuccessAlert, showErrorAlert } from '@/services/alert.js';

function getSessionToken() {
  return JSON.parse(sessionStorage.getItem('session'))?.access_token ?? '';
}

const FormBuilderTab = () => {
  const [questions, setQuestions] = useState([]);
  const [mode, setMode] = useState('edit'); // edit | preview | submit
  const [formName, setFormName] = useState('');
  const [saving, setSaving] = useState(false);

  // ===== Normal Question =====
  const addQuestion = () => {
    if (mode !== 'edit') return;
    const newQ = new FormQuestion();
    setQuestions((prev) => [...prev, newQ]);
  };

  // ===== Excel Table Question =====
  const addExcelQuestion = () => {
    if (mode !== 'edit') return;

    const tableCount = questions.filter((q) => q.type === 'table').length + 1;

    const newQ = new FormQuestion(`Table ${tableCount}`, 'table', [], {
      columns: [
        { key: `col_${crypto.randomUUID().slice(0, 6)}`, label: 'Question', editable: true },
        { key: `col_${crypto.randomUUID().slice(0, 6)}`, label: 'Answer', editable: true },
      ],
      rows: [{ label: 'Row 1' }],
      rowHeaderLabel: 'Row Name',
    });

    setQuestions((prev) => [...prev, newQ]);

    // Auto-scroll into view
    setTimeout(() => {
      const element = document.getElementById(newQ.id);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // ===== Delete Question =====
  const deleteQuestion = (id) => {
    if (mode !== 'edit') return;
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // ===== Update Question =====
  const updateQuestion = (id, key, value) => {
    setQuestions((prev) =>
      prev.map((q) => {
        const instance = FormQuestion.fromJSON(q);

        if (q.id === id) {
          // 🟢 Auto rebuild config when switching to table
          if (key === 'type' && value === 'table') {
            instance.type = 'table';
            instance.config = {
              columns: [
                { key: `col_${crypto.randomUUID().slice(0, 6)}`, label: 'Question', editable: true },
                { key: `col_${crypto.randomUUID().slice(0, 6)}`, label: 'Answer', editable: true },
              ],
              rows: [{ label: 'Row 1' }],
              rowHeaderLabel: 'Row Name',
            };
          } else if (key === 'type' && value !== 'table') {
            instance.type = value;
            instance.config = {};
          } else {
            instance.updateField(key, value);
          }
          return instance;
        }
        return q;
      })
    );
  };

  // ===== Option Handlers =====
  const addOption = (id) => {
    if (mode !== 'edit') return;
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const instance = FormQuestion.fromJSON(q);
          instance.addOption();
          return instance;
        }
        return q;
      })
    );
  };

  const updateOption = (id, idx, value) => {
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
  };

  const removeOption = (id, index) => {
    if (mode !== 'edit') return;
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
  };

  // ===== Table Handlers =====
  const addColumn = (id, name = 'Column') => {
    if (mode !== 'edit') return;
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === id && q.type === 'table') {
          const instance = FormQuestion.fromJSON(q);
          instance.addColumn(name);
          return instance;
        }
        return q;
      })
    );
  };

  const updateColumn = (id, colIndex, updatedProps) => {
    if (mode !== 'edit') return;
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === id && q.type === 'table') {
          const instance = FormQuestion.fromJSON(q);
          instance.updateColumn(colIndex, updatedProps);
          return instance;
        }
        return q;
      })
    );
  };

  const removeColumn = (id, colIndex) => {
    if (mode !== 'edit') return;
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === id && q.type === 'table') {
          const instance = FormQuestion.fromJSON(q);
          instance.removeColumn(colIndex);
          return instance;
        }
        return q;
      })
    );
  };

  const toggleColumnEditable = (id, colIndex) => {
    if (mode !== 'edit') return;
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === id && q.type === 'table') {
          const instance = FormQuestion.fromJSON(q);
          const col = instance.config.columns[colIndex];
          instance.updateColumn(colIndex, { editable: !col.editable });
          return instance;
        }
        return q;
      })
    );
  };

  // ===== Table Row Handlers =====
  const addRow = (id) => {
    if (mode !== 'edit') return;
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === id && q.type === 'table') {
          const instance = FormQuestion.fromJSON(q);
          instance.addRow();
          return instance;
        }
        return q;
      })
    );
  };

  const removeRow = (id, rowIndex) => {
    if (mode !== 'edit') return;
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === id && q.type === 'table') {
          const instance = FormQuestion.fromJSON(q);
          instance.removeRow(rowIndex);
          return instance;
        }
        return q;
      })
    );
  };

  const updateRowCell = (id, rowIndex, colId, value) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === id && q.type === 'table') {
          const instance = FormQuestion.fromJSON(q);
          instance.updateRowCell(rowIndex, colId, value);
          return instance;
        }
        return q;
      })
    );
  };

  // ===== Save Handler =====
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
      showSuccessAlert('Form saved successfully!');
    } else {
      showErrorAlert('Something went wrong while saving.');
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

      {/* Top Controls */}
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
          onAddExcelQuestion={addExcelQuestion}
          mode={mode}
          setMode={setMode}
          onSave={handleSave}
          saving={saving}
        />
      </Paper>

      <Divider sx={{ mb: 0 }} />

      {/* Main Area */}
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
            mode={mode}
            deleteQuestion={deleteQuestion}
            updateQuestion={updateQuestion}
            updateOption={updateOption}
            addOption={addOption}
            removeOption={removeOption}
            addColumn={addColumn}
            updateColumn={updateColumn}
            removeColumn={removeColumn}
            toggleColumnEditable={toggleColumnEditable}
            addRow={addRow}
            removeRow={removeRow}
            updateRowCell={updateRowCell}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default FormBuilderTab;
