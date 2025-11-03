import { Box, IconButton, Button, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import QuestionRenderer from './QuestionRenderer';
import QuestionEditor from './QuestionEditor';
import ExcelQuestionRenderer from './ExcelQuestionRenderer';
import { useEffect, useState } from 'react';

const FormPreviewRenderer = ({
  questions,
  mode = 'edit', // 'edit' | 'preview' | 'submit'
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

  // Initialize answers for submit mode
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
      setLoadingButtons((prev) => ({ ...prev, [`delete_${id}`]: false }));
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
      else console.log('Form submitted!', formJSON);
    } finally {
      setLoadingButtons((prev) => ({ ...prev, submit: false }));
    }
  };

  // ==========================================
  // 🔥 MAIN RENDERER LOGIC
  // ==========================================
  return (
    <Box>
      {questions.map((q) => (
        <Box key={q.id} mt={3} p={2} border="1px solid #ccc" borderRadius={2}>
          {/* Delete button (only available in edit mode) */}
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
            q.type === 'table' ? (
              <ExcelQuestionRenderer
                q={q}
                mode="edit"
                addRow={addRow}
                removeRow={removeRow}
                toggleColumnEditable={toggleColumnEditable}
                // 🟢 Proper column label update handler
                updateColumnLabel={(id, colIndex, newLabel) => {
                  const updatedColumns = q.config.columns.map((col, i) =>
                    i === colIndex ? { ...col, label: newLabel } : col
                  );

                  updateQuestion(id, 'config', {
                    ...q.config,
                    columns: updatedColumns,
                  });
                }}
                // 🟢 Update Row Label
                updateRowLabel={(id, rowIdx, newLabel) => {
                  updateQuestion(id, 'config', {
                    ...q.config,
                    rows: q.config.rows.map((r, i) =>
                      i === rowIdx ? { ...r, label: newLabel } : r
                    ),
                  });
                }}
                // 🟢 Update Row Header Label
                updateRowHeaderLabel={(id, newLabel) => {
                  updateQuestion(id, 'config', {
                    ...q.config,
                    rowHeaderLabel: newLabel,
                  });
                }}
                // 🟢 Update Table Name
                updateQuestionLabel={(id, newLabel) => updateQuestion(id, 'label', newLabel)}
              />
            ) : (
              <QuestionEditor
                q={q}
                updateQuestion={updateQuestion}
                updateOption={updateOption}
                addOption={addOption}
                removeOption={removeOption}
              />
            )
          )}

          {/* ======================
                PREVIEW MODE
          ======================= */}
          {mode === 'preview' && (
            q.type === 'table' ? (
              <ExcelQuestionRenderer
                q={q}
                mode="preview"
                answers={formAnswers}
                setAnswers={setFormAnswers}
              />
            ) : (
              <QuestionRenderer q={q} disabled />
            )
          )}

          {/* ======================
                SUBMIT MODE
          ======================= */}
          {mode === 'submit' && (
            q.type === 'table' ? (
              <ExcelQuestionRenderer
                q={q}
                mode="submit"
                answers={formAnswers}
                setAnswers={setFormAnswers}
                addRow={addRow}
                removeRow={removeRow}
                updateColumnLabel={updateColumn}
              />
            ) : (
              <QuestionRenderer
                q={q}
                mode="submit"
                answers={formAnswers}
                setAnswers={setFormAnswers}
                onAnswerChange={handleAnswerChange}
              />
            )
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
            disabled={Object.keys(formAnswers).length < 1 || loadingButtons.submit}
            startIcon={
              loadingButtons.submit && <CircularProgress size={18} color="inherit" />
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
