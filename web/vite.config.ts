import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';

// A production build can leave an open handle (esbuild's service process under
// Node 24) that keeps `vite build` from ever exiting — the bundle is written
// fine, but the process hangs, which makes Vercel hit its 45-min build timeout
// and report the deploy as Error. Force the process to exit once the bundle is
// fully written. Only active for non-watch production builds.
function forceExitAfterBuild(): PluginOption {
  return {
    name: 'force-exit-after-build',
    apply: 'build',
    closeBundle() {
      if (this.meta?.watchMode) return;
      // Let stdout flush, then exit cleanly.
      setTimeout(() => process.exit(0), 100);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), forceExitAfterBuild()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
