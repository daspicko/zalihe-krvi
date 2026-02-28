import { readFileSync } from 'fs'
import path from 'path'
import { minify } from 'rollup-plugin-esbuild-minify'

// Shared map: asset name → Rollup reference ID (from this.emitFile).
// Populated by hashStaticAssets, read by other plugins via this.getFileName(refId).
const assetRefIds = new Map()

/**
 * Rollup plugin: emits static files as hashed assets.
 *
 * Uses rollup's built-in asset pipeline so output naming is controlled
 * by assetFileNames. Registers each file with this.addWatchFile() for
 * correct rebuild behaviour in watch mode.
 *
 * @param {string[]} files - source paths of static files to hash
 */
function hashStaticAssets(files) {
  return {
    name: 'hash-static-assets',
    buildStart() {
      for (const file of files) {
        this.addWatchFile(file)

        const refId = this.emitFile({
          type: 'asset',
          name: path.basename(file),
          source: readFileSync(file)
        })

        assetRefIds.set(path.basename(file), refId)
      }
    }
  }
}

/**
 * Rollup plugin: replaces hashed-asset references inside JS chunks.
 *
 * Runs in the **renderChunk** hook (before sourcemap finalisation) so the
 * replacement is reflected in the generated sourcemap. Resolves final
 * filenames via this.getFileName(refId) which is available in renderChunk.
 *
 * Uses a word-boundary regex so only exact `data.json` / `./data.json` /
 * `/data.json` references are replaced — no accidental partial matches.
 *
 * @param {Array<{original: string}>} replacements - asset base-names to replace
 */
function replaceAssetReferencesInChunks(replacements) {
  return {
    name: 'replace-asset-references-in-chunks',

    renderChunk(code) {
      let changed = false

      for (const { original } of replacements) {
        const refId = assetRefIds.get(original)
        if (!refId) continue

        const hashed = this.getFileName(refId)

        // Match optional leading ./ or / before the filename, at a word boundary
        const escaped = original.replace(/\./g, '\\.')
        const pattern = new RegExp(`(\\.?\\/?)\\b${escaped}\\b`, 'g')
        const replaced = code.replace(pattern, `$1${hashed}`)

        if (replaced !== code) {
          code = replaced
          changed = true
        }
      }

      return changed ? { code, map: null } : null
    }
  }
}

/**
 * Rollup plugin: emits index.html as a Rollup-managed asset with all
 * hashed JS / CSS / JSON references rewritten.
 *
 * Runs in **generateBundle** so every final fileName is available.
 * Uses attribute-targeted regexes instead of plain string replacement
 * to avoid accidental matches in other parts of the HTML.
 *
 * @param {string[]} htmlFiles - source paths of HTML files to process
 */
function updateHtmlReferences(htmlFiles) {
  return {
    name: 'update-html-references',
    generateBundle(options, bundle) {
      if (!options.dir) {
        this.error('update-html-references requires output.dir to be set.')
      }

      const jsEntry = Object.values(bundle).find(c => c.type === 'chunk' && c.isEntry)

      for (const htmlFile of htmlFiles) {
        let html = readFileSync(htmlFile, 'utf-8')

        // Rewrite <script … src="js/main.js"> → hashed entry chunk
        if (jsEntry) {
          html = html.replace(
            /(<script\b[^>]*\bsrc=["'])js\/main\.js(["'])/,
            `$1${jsEntry.fileName}$2`
          )
        }

        for (const item of Object.values(bundle)) {
          if (item.type !== 'asset' || !item.name) continue

          // Rewrite <link … href="css/main.css"> → hashed CSS asset
          if (item.name.endsWith('.css')) {
            const escaped = item.name.replace(/\./g, '\\.')
            html = html.replace(
              new RegExp(`(<link\\b[^>]*\\bhref=["'])css/${escaped}(["'])`),
              `$1${item.fileName}$2`
            )
          }

          // Rewrite <link … href="/data.json"> or href="data.json" → hashed JSON asset
          if (item.name.endsWith('.json')) {
            const escaped = item.name.replace(/\./g, '\\.')
            html = html.replace(
              new RegExp(`(<link\\b[^>]*\\bhref=["'])/?${escaped}(["'])`),
              `$1/${item.fileName}$2`
            )
          }
        }

        // Emit HTML as a Rollup-managed asset so other plugins can see it.
        this.emitFile({
          type: 'asset',
          name: path.basename(htmlFile),
          fileName: path.basename(htmlFile),
          source: html
        })
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
      const name = assetInfo.name ?? ''
      if (name.endsWith('.css')) return 'css/[name]-[hash][extname]'
      return '[name]-[hash][extname]'
    },
    sourcemap: true
  },
  plugins: [
    hashStaticAssets(['./css/main.css', './data.json']),
    replaceAssetReferencesInChunks([{ original: 'data.json' }]),
    minify({ logLevel: 'debug', logLimit: 100 }),
    updateHtmlReferences(['./index.html'])
  ]
}