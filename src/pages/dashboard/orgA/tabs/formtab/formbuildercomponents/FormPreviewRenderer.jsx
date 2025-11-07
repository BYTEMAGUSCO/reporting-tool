import { Box, IconButton, Button, CircularProgress, Typography } from '@mui/material';
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
                      i === colIndex ? { ...col, label: newLabel } : col
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
              ) : q.type === 'footer' ? (
                // 🟣 Footer Section — Editable Version
                <>
                  <QuestionEditor
                    q={q}
                    updateQuestion={updateQuestion}
                    updateOption={updateOption}
                    addOption={addOption}
                    removeOption={removeOption}
                  />

                  {/* Optional Live Preview Below the Editor */}
                  <Box
                    textAlign="center"
                    p={2}
                    mt={2}
                    border="1px dashed #aaa"
                    borderRadius={2}
                    bgcolor="#fafafa"
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      gutterBottom
                      sx={{ color: '#444' }}
                    >
                      Live Footer Preview
                    </Typography>

                    <Box
                      display="flex"
                      justifyContent="space-between"
                      mt={3}
                      mb={2}
                      px={5}
                    >
                      <Box>
                        <Typography fontSize={13}>
                          {q.config.preparedByLabel || 'Prepared by'}:
                        </Typography>
                        <Typography
                          sx={{
                            textDecoration: 'underline',
                            minWidth: 160,
                            height: 18,
                          }}
                        >
                          &nbsp;
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {q.config.preparedByRole || 'Role'} (Signature over Printed Name)
                        </Typography>
                      </Box>

                      <Box>
                        <Typography fontSize={13}>
                          {q.config.submittedByLabel || 'Submitted by'}:
                        </Typography>
                        <Typography
                          sx={{
                            textDecoration: 'underline',
                            minWidth: 160,
                            height: 18,
                          }}
                        >
                          &nbsp;
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {q.config.submittedByRole || 'Role'} (Signature over Printed Name)
                        </Typography>
                      </Box>
                    </Box>

                    {q.config.showDate && (
                      <Typography fontSize={13} mt={2}>
                        Date Accomplished: ______________________
                      </Typography>
                    )}

                    <Typography
                      variant="caption"
                      mt={1}
                      color="text.secondary"
                      fontStyle="italic"
                    >
                      {q.config.noteText ||
                        'Note: This form is generated and submitted through the Barangay Management System (BMS).'}
                    </Typography>
                  </Box>
                </>
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

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    mt={2}
                    mb={2}
                    px={5}
                  >
                    <Box>
                      <Typography fontSize={13}>{q.config.preparedByLabel}</Typography>
                      <Typography sx={{ textDecoration: 'underline', minWidth: 160 }}>
                        &nbsp;
                      </Typography>
                      <Typography variant="caption">
                        {q.config.preparedByRole}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography fontSize={13}>{q.config.submittedByLabel}</Typography>
                      <Typography sx={{ textDecoration: 'underline', minWidth: 160 }}>
                        &nbsp;
                      </Typography>
                      <Typography variant="caption">
                        {q.config.submittedByRole}
                      </Typography>
                    </Box>
                  </Box>

                  {q.config.showDate && (
                    <Typography fontSize={13}>
                      Date Accomplished: ______________________
                    </Typography>
                  )}
                  <Typography variant="caption" mt={1} color="text.secondary">
                    {q.config.noteText}
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
              ) : (
                <QuestionRenderer
                  q={q}
                  mode="submit"
                  answers={formAnswers}
                  setAnswers={setFormAnswers}
                  onAnswerChange={handleAnswerChange}
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
