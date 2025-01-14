import { useTranslation } from 'react-i18next';
import './App.css';
import AppComponent from 'containers/App';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { ToastContainer } from 'react-toast';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

const theme = createTheme({
  typography: {
    fontFamily: 'SVN-Gilroy',
    fontSize: 14,
  },
});
function App() {
  const { i18n } = useTranslation();
  const changeLanguage = lng => {
    i18n.changeLanguage(lng);
  };
  return (
    <BrowserRouter basename="/bnpl-admin">
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <AppComponent />
          </LocalizationProvider>
        </ThemeProvider>
        <ToastContainer delay={3000} position="bottom-center" />
      </RecoilRoot>
    </BrowserRouter>
  );
}

export default App;
