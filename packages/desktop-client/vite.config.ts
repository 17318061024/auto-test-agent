import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        // 主进程入口
        entry: 'src/main/index.ts',
      },
      {
        // 预加载脚本（可选）
        onstart(args) {
          args.reload()
        },
      },
    ]),
    renderer(),
  ],
})
