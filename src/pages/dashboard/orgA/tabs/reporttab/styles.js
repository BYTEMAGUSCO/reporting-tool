export const loginBtnStyles = {
  textTransform: 'none',
  fontWeight: 'bold',
  borderRadius: '0.5rem',
  backgroundColor: '#facc15',
  boxShadow: '0 3px 6px rgba(128, 128, 128, 0.4)',
  color: 'black',
  transition: 'box-shadow 0.3s ease, background-color 0.3s ease',
  px: 2,
  py: 1,
  '&:hover': {
    backgroundColor: '#fbbf24',
    boxShadow: '0 6px 12px rgba(128, 128, 128, 0.7)',
  },
  '&:disabled': {
    backgroundColor: '#fde68a',
    boxShadow: 'none',
    color: '#a16207',
    cursor: 'not-allowed',
  },
};

export const btnOutlinedStyles = {
  borderRadius: '0.5rem',
  px: 2,
  py: 1,
  textTransform: 'none',
  fontWeight: 'bold',
  color: '#facc15',
  borderColor: '#facc15',
  backgroundColor: 'transparent',
  boxShadow: 'none',
  transition:
    'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    backgroundColor: '#f97316',
    color: 'white',
    borderColor: '#f97316',
    boxShadow: '0 6px 12px rgba(128, 128, 128, 0.7)',
  },
  '&:disabled': {
    borderColor: '#fde68a',
    color: '#fde68a',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
};
