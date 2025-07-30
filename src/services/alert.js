import Swal from 'sweetalert2';

// Inject Roboto font styles directly
const injectFontStyle = () => {
  const style = document.createElement('style');
  style.innerHTML = `
    .swal2-title,
    .swal2-html-container,
    .swal2-confirm,
    .swal2-cancel {
      font-family: "Roboto", "Helvetica", "Arial", sans-serif !important;
    }

    .swal2-popup {
      border-radius: 0.5rem !important;
    }

    .swal2-confirm {
      background-color: #38bdf8 !important;
      color: white !important;
      border: none !important;
      font-weight: 500 !important;
      padding: 0.6rem 1.2rem !important;
      border-radius: 0.5rem !important;
    }

    .swal2-cancel {
      background-color: #ef4444 !important;
      color: white !important;
      border: none !important;
      font-weight: 500 !important;
      padding: 0.6rem 1.2rem !important;
      border-radius: 0.5rem !important;
    }

    .swal2-input,
    .swal2-textarea,
    .swal2-select {
      border-radius: 0.5rem !important;
    }

    .swal2-actions {
      gap: 0.5rem !important;
    }

    .swal2-icon {
      border-radius: 0.5rem !important;
    }

    .swal2-toast {
      border-radius: 0.5rem !important;
    }
  `;
  document.head.appendChild(style);
};


// Ensure styles are injected once
let styleInjected = false;
function ensureFontStyle() {
  if (!styleInjected) {
    injectFontStyle();
    styleInjected = true;
  }
}

export function showSuccessAlert(message = 'Operation successful!') {
  ensureFontStyle();
  return Swal.fire({
    icon: 'success',
    title: 'Success!',
    text: message,
    confirmButtonText: 'OK',
  });
}

export function showErrorAlert(message = 'Something went wrong.') {
  ensureFontStyle();
  return Swal.fire({
    icon: 'error',
    title: 'Oops!',
    text: message,
    confirmButtonText: 'OK',
  });
}

export async function showConfirmAlert(message = 'Are you sure?') {
  ensureFontStyle();
  const result = await Swal.fire({
    icon: 'warning',
    title: message,
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    focusCancel: true,
  });

  return result.isConfirmed;
}

