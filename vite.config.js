import { defineConfig, loadEnv } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';

export default defineConfig((command, mode) => {
  const clientEnvKeys = [
    'REACT_APP_BASE_SERVICE_URL',
    'REACT_APP_CSS_SERVICE_URL',
    'REACT_APP_TENANT_ID',
    'REACT_APP_CLIENT_ID',
    'REACT_APP_REDIRECT_URI',
  ];
  const env = loadEnv(mode, process.cwd(), [...clientEnvKeys, 'HTTPS', 'PORT']);
  const processEnvValues = Object.fromEntries(
    clientEnvKeys.map((key) => [`process.env.${key}`, JSON.stringify(env[key]) ?? 'undefined']),
  );

  const HTTPS = (env.HTTPS === 'true');
  const PORT = env.PORT ?? 3000;

  return {
    server: {
      open: true,
      https: HTTPS,
      port: PORT,
      strictPort: true,
    },
    build: {
      outDir: 'build',
    },
    plugins: [
      react(),
      basicSsl(),
    ],
    define: processEnvValues,
  };
});
