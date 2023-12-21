import { ThemeProvider, createTheme, makeStyles } from '@material-ui/core/styles';
import { AuthProvider } from 'react-oidc-context';
import App from './App';
import OidcConfig from './authorization/OidcConfig';

const theme = createTheme();

const useStyles = makeStyles(() => {
  // eslint-disable-next-line no-restricted-syntax, no-labels, no-unused-labels, no-empty
  root: {}
});

function WrappedSecuredApp() {
  useStyles();
  return (
    <ThemeProvider theme={theme}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <AuthProvider {...OidcConfig}>
        <App />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default WrappedSecuredApp;
