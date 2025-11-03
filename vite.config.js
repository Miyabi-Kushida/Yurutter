import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic'
    })
  ],
  server: {
    watch: {
      // macOS で監視イベントを取りこぼすケースに対応
      usePolling: true,
      interval: 200
    }
  }
})

