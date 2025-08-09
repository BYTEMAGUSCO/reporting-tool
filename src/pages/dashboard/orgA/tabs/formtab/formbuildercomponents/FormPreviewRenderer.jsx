import { Box, IconButton, Button, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import QuestionRenderer from './QuestionRenderer';
import QuestionEditor from './QuestionEditor';
import { useEffect, useState } from 'react';

const FormPreviewRenderer = ({
  questions,
  mode = 'edit', // 'edit' | 'preview' | 'submit'
  deleteQuestion,
  updateQuestion,
  updateOption,
  addOption,
  removeOption,
  answers = {},
  onSubmit,
  onAnswerChange,
}) => {
  const [formAnswers, setFormAnswers] = useState({});
  const [loadingButtons, setLoadingButtons] = useState({}); // { delete_<id>: true, submit: true }

  useEffect(() => {
    if (mode === 'submit') {
      setFormAnswers(answers || {});
    }
  }, [answers, mode]);

  const handleAnswerChange = (id, value) => {
    const updated = {
      ...formAnswers,
      [id]: value,
    };
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
      if (onSubmit) {
        await onSubmit(formJSON);
      } else {
        alert('Form submitted! (still fake, JSON in console ✨)');
      }
    } finally {
      setLoadingButtons((prev) => ({ ...prev, submit: false }));
    }
  };

  return (
    <Box>
      {questions.map((q) => (
        <Box key={q.id} mt={3} p={2} border="1px solid #ccc" borderRadius={2}>
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

          {mode === 'edit' && (
            <QuestionEditor
              q={q}
              updateQuestion={updateQuestion}
              updateOption={updateOption}
              addOption={addOption}
              removeOption={removeOption}
            />
          )}

          {mode === 'preview' && <QuestionRenderer q={q} disabled />}

          {mode === 'submit' && (
            <QuestionRenderer
              q={q}
              mode="submit"
              answers={formAnswers}
              setAnswers={setFormAnswers}
              onAnswerChange={handleAnswerChange}
            />
          )}
        </Box>
      ))}

      {mode === 'submit' && (
        <Box mt={4} textAlign="center">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={
              Object.keys(formAnswers).length < 1 || loadingButtons.submit
            }
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
