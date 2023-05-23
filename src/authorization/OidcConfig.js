const OidcConfig = {
  authority: `${process.env.REACT_APP_BASE_SERVICE_URL}/tenants/${process.env.REACT_APP_TENANT_ID}`,
  clientId: process.env.REACT_APP_CLIENT_ID,
  redirectUri: process.env.REACT_APP_REDIRECT_URI,
  responseType: 'code',
  scope: 'openid otds:groups',
  postLogoutRedirectUri: process.env.REACT_APP_REDIRECT_URI,
};

export default OidcConfig;
