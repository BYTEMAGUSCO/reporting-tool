import { Paper, Typography } from '@mui/material';
import FormPreviewRenderer from '../../../orgA/tabs/formtab/formbuildercomponents/FormPreviewRenderer';

const FormQuestionsPanel = ({ selectedFormId, selectedQuestions, answers, onAnswerChange, onSubmit }) => (
  <Paper sx={{ p: 3, borderRadius: 2 }}>
    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
      Answer the Questions:
    </Typography>

    <FormPreviewRenderer
      key={selectedFormId}
      questions={selectedQuestions}
      mode="submit"
      answers={answers}
      onAnswerChange={onAnswerChange}
      onSubmit={onSubmit}
    />
  </Paper>
);

export default FormQuestionsPanel;
