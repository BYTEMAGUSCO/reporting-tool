import { useState } from 'react';
import { showErrorAlert } from '@/services/alert';

const usePreviewHandler = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);

  const handlePreview = (form) => {
    try {
      if (!form?.form_content) {
        showErrorAlert('This form is empty or corrupted.');
        return;
      }

      const parsed = Array.isArray(form.form_content)
        ? form.form_content
        : JSON.parse(form.form_content);

      if (!Array.isArray(parsed)) throw new Error('Invalid form structure');

      setSelectedForm({ raw: form.form_content, parsed });
      setPreviewOpen(true);
    } catch (err) {
      console.error('❌ Preview error:', err);
      showErrorAlert('This form is corrupted and cannot be previewed 😢');
    }
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setSelectedForm(null);
  };

  return {
    previewOpen,
    selectedForm,
    handlePreview,
    closePreview,
  };
};

export default usePreviewHandler;
