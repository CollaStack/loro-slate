import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: 'src/index.ts',
  format: 'es',
  platform: 'neutral',
  dts: true,
  sourcemap: true,
  hash: false,
})
