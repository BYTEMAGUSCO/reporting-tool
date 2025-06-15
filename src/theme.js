import { createTheme } from '@mui/material/styles';

//this are just colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#facc15', // 🍋 this will change all the primary colors
    },
    secondary: {
      main: '#38bdf8', // 🔵 Soft blue
    },
    error: {
      main: '#ef4444', // ❤️ Danger
    },
    customPink: {
      main: '#f472b6',
      contrastText: '#fff',
    }
  },
});

export default theme;
