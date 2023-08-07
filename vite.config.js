import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      // workaround to bug          
      'wc-context': path.resolve('.'),
    },
  },
})
