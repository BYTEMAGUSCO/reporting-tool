import { showSuccessAlert, showErrorAlert } from '@/services/alert';

export async function handleSaveLayout(formName, questions, token, supabaseUrl) {
const isValid =
  formName.trim() !== '' &&
  questions.every((q) => {
    // text blocks don't need labels
    if (q.type === 'text_block') return true;

    // all other question types do need labels
    if (!q.label) return false;

    // choice types need options
    if (['multiple_choice', 'checkbox', 'dropdown'].includes(q.type)) {
      return q.options.length > 0;
    }

    return true;
  });

  if (!isValid) {
    showErrorAlert('Please fill in all required fields before saving!');
    return false;
  }

  if (!token) {
    showErrorAlert('User not authenticated!');
    return false;
  }

  const layout = questions.map((q) => q.toJSON());
  const payload = {
    form_name: formName,
    form_content: layout,
    is_visible: 'N',
  };

  console.log("🟦 PAYLOAD SENDING TO BACKEND:", payload);

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/dynamic-forms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const status = response.status;
    const rawText = await response.text();
    console.log("🟧 RAW RESPONSE TEXT:", rawText);
    console.log("🟨 STATUS CODE:", status);

    let json = {};
    try {
      json = JSON.parse(rawText);
    } catch (e) {
      console.log("⚠️ Could not parse JSON:", e.message);
    }

    console.log("🟥 PARSED JSON:", json);

    if (!response.ok) {
      const message =
        json?.error?.message ||
        json?.message ||
        `Unknown error (status ${status})`;

      throw new Error(message);
    }

    showSuccessAlert('Form saved successfully, make it visible in the manage forms tab');
    return true;

  } catch (err) {
    console.error("💥 FULL ERROR OBJECT:", err);
    showErrorAlert('Error saving form: ' + err.message);
    return false;
  }
}
