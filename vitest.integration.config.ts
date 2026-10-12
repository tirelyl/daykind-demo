import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/integration/**/*.test.ts'],
    environment: 'node',
    env: loadEnv('test', process.cwd(), ''),
    testTimeout: 30000,
    hookTimeout: 30000,
    fileParallelism: false,
  },
})
