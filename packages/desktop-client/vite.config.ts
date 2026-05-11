import { defineConfig, type Plugin } from 'vite'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { readFileSync } from 'fs'

function loadEnvFile(filePath: string): Record<string, string> {
  try {
    const content = readFileSync(filePath, 'utf-8')
    const env: Record<string, string> = {}
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIndex = trimmed.indexOf('=')
      if (eqIndex === -1) continue
      const key = trimmed.slice(0, eqIndex).trim()
      const value = trimmed.slice(eqIndex + 1).trim()
      env[key] = value
    }
    return env
  } catch {
    return {}
  }
}

export default defineConfig({
  plugins: [
    vue(),
    electron([
      {
        entry: 'src/main/index.ts',
        vite: {
          build: {
            rollupOptions: {
              external: [
                'bufferutil',
                'utf-8-validate',
                '@auto-test-agent/task-executor',
                /^@midscene\/.*/,
                '@playwright/test',
                'playwright',
                'playwright-core',
              ],
            },
          },
        },
        onstart(args) {
          const env = {
            ...process.env,
            ...loadEnvFile(resolve(__dirname, '.env')),
          }
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
