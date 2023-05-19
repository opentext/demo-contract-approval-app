import App from './App';
import {
  AuthProvider,
  authService,
} from './authorization/ocpRestClient';

function WrappedSecuredApp() {
  return (
    <AuthProvider authService={authService}>
      <App />
    </AuthProvider>
  );
}

export default WrappedSecuredApp;
