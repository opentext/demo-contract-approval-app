import { defineConfig, loadEnv } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  const env = loadEnv('mock', process.cwd(), '');

  const HTTPS = `${env.HTTPS ?? false}`;
  const PORT = `${env.PORT ?? '3000'}`;

  const processEnvValues = {
    'process.env': Object.entries(env).reduce((prev, [key, val]) => ({
      ...prev, [key]: val,
    }), {}),
  };

  return {
    server: {
      open: true,
      https: HTTPS,
      port: PORT,
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
