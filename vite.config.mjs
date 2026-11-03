// Compila src/ a dist/index.html (construir.js lo copia a panel-admin/index.html): un solo archivo con JS, CSS, logo y tipografías
// incluidos, para abrirlo con doble clic y sin conexión a internet.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

const dir = import.meta.dirname;
export default defineConfig({
  root: dir + '/src',
  base: './',
  plugins: [react(), viteSingleFile()],
  build: { outDir: dir + '/dist', emptyOutDir: true, assetsInlineLimit: 100_000_000 },
  server: { fs: { allow: [dir + '/..'] } }
});
