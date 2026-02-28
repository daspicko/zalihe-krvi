import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { minify } from 'rollup-plugin-esbuild-minify'

/**
 * Rollup plugin: emits static files as hashed assets.
 * Uses rollup's built-in asset pipeline — output naming controlled by assetFileNames.
 * @param {string[]} files - paths to static files to hash
 */
function hashStaticAssets(files) {
  return {
    name: 'hash-static-assets',
    buildStart() {
      for (const file of files) {
        const content = readFileSync(file)
        this.emitFile({
          type: 'asset',
          name: path.basename(file),
          source: content
        })
      }
    }
  }
}

/**
 * Rollup plugin: replaces asset references inside JS chunks at bundle time.
 * Runs during generateBundle so all final asset filenames are known.
 * @param {Array<{original: string}>} replacements - original filenames to replace
 */
function replaceAssetReferencesInChunks(replacements) {
  return {
    name: 'replace-asset-references-in-chunks',
    generateBundle(_options, bundle) {
      const assetMap = new Map()

      for (const item of Object.values(bundle)) {
        if (item.type === 'asset') {
          assetMap.set(item.name, item.fileName)
        }
      }

      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk') continue

        for (const { original } of replacements) {
          const hashed = assetMap.get(original)
          if (hashed) {
            chunk.code = chunk.code.replaceAll(original, hashed)
          }
        }
      }
    }
  }
}

/**
 * Rollup plugin: copies HTML to output dir with hashed JS/CSS/asset references.
 * @param {string[]} htmlFiles - paths to HTML files to process
 */
function updateHtmlReferences(htmlFiles) {
  return {
    name: 'update-html-references',
    writeBundle(options, bundle) {
      const jsEntry = Object.values(bundle).find(c => c.type === 'chunk' && c.isEntry)

      for (const htmlFile of htmlFiles) {
        let html = readFileSync(htmlFile, 'utf-8')

        if (jsEntry) {
          html = html.replace('js/main.js', jsEntry.fileName)
        }

        for (const item of Object.values(bundle)) {
          if (item.type !== 'asset') continue

          if (item.fileName.endsWith('.css')) {
            html = html.replace(`css/${item.name}`, item.fileName)
          }

          if (item.fileName.endsWith('.json')) {
            html = html.replace(`/${item.name}`, `/${item.fileName}`)
          }
        }

        const outPath = path.join(options.dir, path.basename(htmlFile))
        writeFileSync(outPath, html, 'utf-8')
      }
    }
  }
}

export default {
  input: './js/main.js',
  output: {
    dir: './dist',
    entryFileNames: 'js/[name]-[hash].js',
    assetFileNames: (assetInfo) => {
      if (assetInfo.names?.[0]?.endsWith('.css')) return 'css/[name]-[hash][extname]'
      return '[name]-[hash][extname]'
    },
    sourcemap: true
  },
  plugins: [
    hashStaticAssets(['./css/main.css', './data.json']),
    minify({ logLevel: 'debug', logLimit: 100 }),
    replaceAssetReferencesInChunks([{ original: 'data.json' }]),
    updateHtmlReferences(['./index.html'])
  ]
}