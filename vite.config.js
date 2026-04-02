import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function resolveBasePath() {
  const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];

  if (!repository || process.env.GITHUB_ACTIONS !== 'true') {
    return '/';
  }

  return /\.github\.io$/i.test(repository) ? '/' : `/${repository}/`;
}

export default defineConfig({
  plugins: [react()],
  base: resolveBasePath(),
});
