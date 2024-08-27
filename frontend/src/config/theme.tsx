import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4CAF50', // Green color for primary actions
    },
    secondary: {
      main: '#FFFFFF', // White color for secondary actions
    },
    background: {
      default: '#121212', // Overall background color
      paper: '#1E1E1E', // Background color for cards, forms, etc.
    },
    text: {
      primary: '#FFFFFF', // White text for primary content
      secondary: '#AAAAAA', // Lighter gray for secondary text
    },
    error: {
      main: '#F44336', // Red for error messages
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#FFFFFF', // White border for inputs
            },
            '&:hover fieldset': {
              borderColor: '#FFFFFF', // White border on hover
            },
            '&.Mui-focused fieldset': {
              borderColor: '#FFFFFF', // White border when focused
            },
          },
          input: {
            color: '#FFFFFF', // White text inside inputs
          },
          label: {
            color: '#FFFFFF', // White label text
          },
          '.MuiFormHelperText-root': {
            color: '#F44336', // Red for error messages
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          color: '#FFFFFF', // White text for all buttons
          textTransform: 'none', // Remove uppercase transformation
          '&.MuiButton-containedPrimary': {
            backgroundColor: '#4CAF50',
            '&:hover': {
              backgroundColor: '#66BB6A', // Darker green on hover
            },
          },
          '&.MuiButton-containedSecondary': {
            color: '#FFFFFF', // White text for secondary buttons
          },
          '&.MuiButton-outlined': {
            borderColor: '#616161', // Outline color for outlined buttons
            color: '#FFFFFF', // White text for outlined buttons
            '&:hover': {
              borderColor: '#FFFFFF', // White border on hover
            },
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#FFFFFF', // Default color for all typography
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E1E1E', // Background color for Paper components
          color: '#FFFFFF', // White text inside Paper components
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          color: '#FFFFFF', // White color for all icons
        },
      },
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif', // Default font family
    h5: {
      fontWeight: 500,
      color: '#FFFFFF', // White color for headings
    },
    body1: {
      color: '#FFFFFF', // White color for normal text
    },
    body2: {
      color: '#AAAAAA', // Lighter gray for secondary text
    },
  },
});

export default theme;
