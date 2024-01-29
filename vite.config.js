import { defineConfig, loadEnv } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';

export default defineConfig((command, mode) => {
  const env = loadEnv(mode, process.cwd(), '');

  const processEnvValues = {
    'process.env': Object.entries(env).reduce((prev, [key, val]) => ({
      ...prev, [key]: val,
    }), {}),
  };

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
