import { minify } from 'rollup-plugin-esbuild-minify'

export default {
  input: './js/main.js',
  output: { file: './dist/js/main.js', sourcemap: true },
  plugins: [
    minify({ logLevel: 'debug', logLimit: 100 })
  ]
}