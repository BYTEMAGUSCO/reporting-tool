import { createTheme } from '@mui/material/styles';

//note this file are the universal rules for the mui components

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
      main: '#ef4444', // ❤️
    },
    customPink: {
      main: '#f472b6',
      contrastText: '#fff',
    }
  },
  components: {
    MuiTextField: {
      defaultProps: {
        margin: 'dense',
        fullWidth: true,
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
  },
});

export default theme;
