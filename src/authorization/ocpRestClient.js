import axios from "axios";
import {
    AuthProvider,
    AuthService,
    useAuth,
} from 'react-oauth2-pkce';

const authService = new AuthService({
    clientId: process.env.REACT_APP_CLIENT_ID,
    authorizeEndpoint: process.env.REACT_APP_BASE_SERVICE_URL + '/tenants/' + process.env.REACT_APP_TENANT_ID + '/oauth2/auth',
    tokenEndpoint: process.env.REACT_APP_BASE_SERVICE_URL + '/tenants/' + process.env.REACT_APP_TENANT_ID + '/oauth2/token',
    logoutEndpoint: process.env.REACT_APP_BASE_SERVICE_URL + '/tenants/' + process.env.REACT_APP_TENANT_ID + '/oauth2/logout',
    redirectUri: process.env.REACT_APP_REDIRECT_URI,
    scopes: ['openid', 'otds:groups'],
});

const login = async () => authService.authorize();
const logout = async (shouldEndSession) => authService.logout(shouldEndSession);

// This custom logout is required, as the standard PKCE React library (react-oauth2-pkce) doesn't support the id_token_hint mechanism (which is what the OpenText Developer Cloud uses).
// A request with the owners of the react-oauth2-pkce library has been logged to add the id_token_hint support. Feel free to inquire on the matter yourself.
const logoutWithIdTokenHint = (shouldEndSession, idToken) => {
    logout(shouldEndSession);
    window.sessionStorage.removeItem("ca_token_expiration_time");
    window.location.replace(process.env.REACT_APP_BASE_SERVICE_URL + '/tenants/' + process.env.REACT_APP_TENANT_ID + '/oauth2/logout?id_token_hint=' + encodeURIComponent(idToken) + '&post_logout_redirect_uri=' + encodeURIComponent(process.env.REACT_APP_REDIRECT_URI));
}

// If you want to test (access) token expiry, you can enable this interceptor method and look at the developer tools console in your browser
// to force a 401/Unauthorized error and see how it gets intercepted and remediated (new token fetched) by the reponse interceptor
// axios.interceptors.request.use(
//     async (config) => {
//         const tokenExpirationTime = window.sessionStorage.getItem("ca_token_expiration_time");
//         const timeUntilTokenExpires = 5000;
//         if (!tokenExpirationTime) {
//             window.sessionStorage.setItem("ca_token_expiration_time", Date.now() + timeUntilTokenExpires);
//         } else {
//             if (Date.now() > tokenExpirationTime) {
//             if (config.headers.Authorization !== "Bearer cuicuibidon") {
//                 config.headers = {
//                     ...config.headers,
//                     Authorization: "Bearer this_access_token_is_not_valid"
//                 };
//                 config.sent = false;
//                 }
//             window.sessionStorage.setItem("ca_token_expiration_time", Date.now() + timeUntilTokenExpires);
//             }
//         }
//
//         return config;
//     },
//     (error) => Promise.reject(error)
// );
  
// Promise that resolves when the acces_token is refreshed.
let tokenRefreshPromise = undefined;

// Count the number of pending requests that are waiting for a token refresh
let tokenRefreshWaitCount = 0;

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error?.config;

        if (error?.response?.status === 401 && !config?.sent) {
            config.sent = true;
            tokenRefreshWaitCount++;
            
            if (tokenRefreshWaitCount === 1) {
                // Only create a new tokenRefreshPromise for the first 401 after the previous refresh.
                tokenRefreshPromise = authService.fetchToken(authService.getAuthTokens().refresh_token, true);
            }
            // Wait for the refreshed token before retrying.
            await tokenRefreshPromise.then((authTokens) => {
                if (authTokens.access_token) {
                    config.headers = {
                        ...config.headers,
                        Authorization: `Bearer ${authTokens.access_token}`,
                    };
                }
            });
            tokenRefreshWaitCount--;

            // Retry the request
            return axios(config);
        }
    
        return Promise.reject(error);
    }
);

export {
    AuthProvider,
    authService,
    axios,
    login,
    logout,
    logoutWithIdTokenHint,
    useAuth
};
