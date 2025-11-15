import {
  Box,
  IconButton,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import QuestionRenderer from './QuestionRenderer';
import QuestionEditor from './QuestionEditor';
import ExcelQuestionRenderer from './ExcelQuestionRenderer';
import { useEffect, useState } from 'react';

const FormPreviewRenderer = ({
  questions,
  mode = 'edit',
  deleteQuestion,
  updateQuestion,
  updateOption,
  addOption,
  removeOption,
  addColumn,
  updateColumn,
  removeColumn,
  toggleColumnEditable,
  addRow,
  removeRow,
  answers = {},
  onSubmit,
  onAnswerChange,
}) => {
  const [formAnswers, setFormAnswers] = useState({});
  const [loadingButtons, setLoadingButtons] = useState({});

  useEffect(() => {
    if (mode === 'submit') {
      setFormAnswers(answers || {});
    }
  }, [answers, mode]);

  const handleAnswerChange = (id, value) => {
    const updated = { ...formAnswers, [id]: value };
    setFormAnswers(updated);
    if (onAnswerChange) onAnswerChange(id, value);
  };

  const handleDelete = async (id) => {
    setLoadingButtons((prev) => ({ ...prev, [`delete_${id}`]: true }));
    try {
      await deleteQuestion(id);
    } finally {
      setLoadingButtons((prev) => ({
        ...prev,
        [`delete_${id}`]: false,
      }));
    }
  };

  const handleSubmit = async () => {
    setLoadingButtons((prev) => ({ ...prev, submit: true }));

    const formJSON = {
      submittedAt: new Date().toISOString(),
      answers: formAnswers,
    };

    try {
      if (onSubmit) await onSubmit(formJSON);
    } finally {
      setLoadingButtons((prev) => ({ ...prev, submit: false }));
    }
  };

  // ============================================================
  // 🔥 VALIDATION — Excel required columns must NOT be empty
  // ============================================================
  const hasEmptyRequiredExcelCells = () => {
    for (const q of questions) {
      if (q.type !== 'table') continue;

      const table = formAnswers[q.id] || {};
      const rows = q.config.rows || [];
      const columns = q.config.columns || [];

      for (let r = 0; r < rows.length; r++) {
        for (const col of columns) {
          if (col.editable === false) continue; // skip non-editable fields
          const value = table?.[r]?.[col.key] ?? '';
          if (!value || String(value).trim() === '') return true;
        }
      }
    }
    return false;
  };

  // ============================================================
  // 🔥 VALIDATION — ALL normal fields must have answers
  // ============================================================
  const hasEmptyRequiredNormalFields = () => {
    for (const q of questions) {
      if (
        q.type === 'footer' ||
        q.type === 'text_block' ||
        q.type === 'table'
      )
        continue;

      const value = formAnswers[q.id];

      // checkbox array required
      if (q.type === 'checkbox') {
        if (!value || value.length === 0) return true;
        continue;
      }

      // all other fields
      if (!value || String(value).trim() === '') return true;
    }
    return false;
  };

  // ============================================================
  // 🔥 MAIN RENDER
  // ============================================================
  return (
    <Box>
      {questions.map((q) => (
        <Box
          key={q.id}
          id={q.id}
          mt={3}
          p={2}
          border="1px solid #ccc"
          borderRadius={2}
          sx={{
            backgroundColor: q.type === 'footer' ? '#f6f6f6' : 'white',
            borderStyle: q.type === 'footer' ? 'dashed' : 'solid',
          }}
        >
          {/* Delete button */}
          <Box display="flex" justifyContent="flex-end" alignItems="center">
            {mode === 'edit' && (
              <IconButton
                color="error"
                onClick={() => handleDelete(q.id)}
                disabled={loadingButtons[`delete_${q.id}`]}
              >
                {loadingButtons[`delete_${q.id}`] ? (
                  <CircularProgress size={20} color="error" />
                ) : (
                  <DeleteIcon />
                )}
              </IconButton>
            )}
          </Box>

          {/* ======================
                EDIT MODE
          ======================= */}
          {mode === 'edit' && (
            <>
              {q.type === 'table' ? (
                <ExcelQuestionRenderer
                  q={q}
                  mode="edit"
                  addRow={addRow}
                  removeRow={removeRow}
                  addColumn={addColumn}
                  toggleColumnEditable={toggleColumnEditable}
                  updateColumnLabel={(id, colIndex, newLabel) => {
                    const updatedColumns = q.config.columns.map((col, i) =>
                      i === colIndex
                        ? { ...col, label: newLabel }
                        : col
                    );
                    updateQuestion(id, 'config', {
                      ...q.config,
                      columns: updatedColumns,
                    });
                  }}
                  updateRowLabel={(id, rowIdx, newLabel) => {
                    updateQuestion(id, 'config', {
                      ...q.config,
                      rows: q.config.rows.map((r, i) =>
                        i === rowIdx ? { ...r, label: newLabel } : r
                      ),
                    });
                  }}
                  updateRowHeaderLabel={(id, newLabel) => {
                    updateQuestion(id, 'config', {
                      ...q.config,
                      rowHeaderLabel: newLabel,
                    });
                  }}
                  updateQuestionLabel={(id, newLabel) =>
                    updateQuestion(id, 'label', newLabel)
                  }
                />
              ) : (
                <QuestionEditor
                  q={q}
                  updateQuestion={updateQuestion}
                  updateOption={updateOption}
                  addOption={addOption}
                  removeOption={removeOption}
                />
              )}
            </>
          )}

          {/* ======================
                PREVIEW MODE
          ======================= */}
          {mode === 'preview' && (
            <>
              {q.type === 'table' ? (
                <ExcelQuestionRenderer
                  q={q}
                  mode="preview"
                  answers={formAnswers}
                  setAnswers={setFormAnswers}
                />
              ) : q.type === 'footer' ? (
                <Box textAlign="center" p={2}>
                  <Typography fontWeight="bold" mb={1}>
                    {q.label || 'Footer Section'}
                  </Typography>
                  <Typography variant="caption" mt={1} color="text.secondary">
                    {q.config.noteText}
                  </Typography>
                </Box>
              ) : q.type === 'text_block' ? (
                <Box mt={1}>
                  <Typography
                    sx={{
                      textAlign: q.config.alignment || 'left',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {q.config.text}
                  </Typography>
                </Box>
              ) : (
                <QuestionRenderer q={q} disabled />
              )}
            </>
          )}

          {/* ======================
                SUBMIT MODE
          ======================= */}
          {mode === 'submit' && (
            <>
              {q.type === 'table' ? (
                <ExcelQuestionRenderer
                  q={q}
                  mode="submit"
                  answers={formAnswers}
                  setAnswers={setFormAnswers}
                  addRow={addRow}
                  removeRow={removeRow}
                  updateColumnLabel={updateColumn}
                />
              ) : q.type === 'footer' ? (
                <Box textAlign="center" mt={3}>
                  <Typography variant="body2" color="text.secondary">
                    {q.config.noteText}
                  </Typography>
                </Box>
              ) : q.type === 'text_block' ? (
                <Box mt={1}>
                  <Typography
                    sx={{
                      textAlign: q.config.alignment,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {q.config.text}
                  </Typography>
                </Box>
              ) : (
                <QuestionRenderer
                  q={q}
                  mode="submit"
                  answers={formAnswers}
                  setAnswers={setFormAnswers}
                  onAnswerChange={handleAnswerChange}
                  required
                  error={
                    !formAnswers[q.id] ||
                    String(formAnswers[q.id]).trim() === ''
                  }
                  helperText={
                    !formAnswers[q.id] ||
                    String(formAnswers[q.id]).trim() === ''
                      ? 'This field is required'
                      : ''
                  }
                />
              )}
            </>
          )}
        </Box>
      ))}

      {/* ======================
            SUBMIT BUTTON
      ======================= */}
      {mode === 'submit' && (
        <Box mt={4} textAlign="center">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={
              loadingButtons.submit ||
              hasEmptyRequiredNormalFields() ||
              hasEmptyRequiredExcelCells()
            }
            startIcon={
              loadingButtons.submit && (
                <CircularProgress size={18} color="inherit" />
              )
            }
          >
            {loadingButtons.submit ? 'Submitting...' : 'Submit Form'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FormPreviewRenderer;
