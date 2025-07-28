export async function handleSaveLayout(formName, questions, token, supabaseUrl) {
  const isValid =
    formName.trim() !== '' &&
    questions.every(
      (q) =>
        q.label &&
        (!['multiple_choice', 'checkbox', 'dropdown'].includes(q.type) ||
          q.options.length > 0)
    );

  if (!isValid) {
    alert('Please fill in all required fields before saving!');
    return;
  }

  if (!token) {
    alert('User not authenticated!');
    return;
  }

  const layout = questions.map((q) => q.toJSON());
  const payload = {
    form_name: formName,
    form_content: layout,
  };

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/dynamic-forms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) throw new Error(result?.error?.message || 'Failed to save form');

    alert('Form saved successfully!');
    console.log('✅ Server response:', result);
    return true;
  } catch (err) {
    console.error('🧨 Error saving form:', err);
    alert('Error saving form: ' + err.message);
    return false;
  }
}
