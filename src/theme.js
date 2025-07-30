import { createTheme } from '@mui/material/styles';

// note: this file holds the universal MUI component rules

const theme = createTheme({
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  palette: {
    primary: {
      main: '#facc15', // 🍋 yellow
    },
    secondary: {
      main: '#38bdf8', // 🔵 soft blue
    },
    error: {
      main: '#ef4444', // ❤️ red
    },
    customPink: {
      main: '#f472b6', // 🍬 pink
      contrastText: '#fff',
    },
  },
  components: {
    MuiTextField: {
      defaultProps: {
        margin: 'dense',
        fullWidth: true,
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#888', // 🧱 default outline
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#000', // 🖤 on hover
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#facc15', // 🍋 on focus
            borderWidth: '2px',
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        fullWidth: true,
      },
      styleOverrides: {
        root: {
          margin: '0.5rem 0',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#444',
          fontWeight: 500,
          '&.Mui-selected': {
            color: '#000',
            fontWeight: 700,
          },
          '&:hover': {
            color: '#000',
            backgroundColor: '#fffbe6',
          },
        },
      },
    },
  },
});

export default theme;
