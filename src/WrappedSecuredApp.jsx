import { AuthProvider } from 'oidc-react';
import App from './App';
import OidcConfig from './authorization/OidcConfig';

function WrappedSecuredApp() {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <AuthProvider {...OidcConfig}>
      <App />
    </AuthProvider>
  );
}

export default WrappedSecuredApp;
