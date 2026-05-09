import { defineConfig, type Plugin } from 'vite'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    electron([
      {
        entry: 'src/main/index.ts',
        vite: {
          build: {
            rollupOptions: {
              external: ['bufferutil', 'utf-8-validate'],
            },
          },
        },
        onstart(args) {
          const env = { ...process.env }
          delete env.ELECTRON_RUN_AS_NODE
          args.startup(['.', '--no-sandbox'], { env })
        },
      },
    ]),
    renderer(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
  },
})
