import js from '@eslint/js'
import globals from 'globals'
import path from 'node:path'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const moduleNames = ['account', 'auth', 'health', 'roles', 'users']

// Resolve relative and aliased imports so module boundaries are checked equally.
const architecturePlugin = {
  rules: {
    'no-cross-module-imports': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          crossModule: 'Modul {{source}} tidak boleh mengimpor modul {{target}} secara langsung; integrasikan melalui app.',
        },
      },
      create(context) {
        const filename = path.resolve(context.filename)
        const sourceModule = filename.match(/[\\/]src[\\/]modules[\\/]([^\\/]+)/)?.[1]
        if (!sourceModule) return {}

        function reportCrossModuleImport(node, sourceNode) {
          const specifier = sourceNode?.value
          if (typeof specifier !== 'string') return

          const targetModule = specifier.startsWith('@/modules/')
            ? specifier.replace(/^@\/modules\//, '').split('/')[0]
            : specifier.startsWith('.')
              ? path.resolve(path.dirname(filename), specifier).match(/[\\/]src[\\/]modules[\\/]([^\\/]+)/)?.[1]
              : undefined

          if (targetModule && targetModule !== sourceModule) {
            context.report({ node: sourceNode, messageId: 'crossModule', data: { source: sourceModule, target: targetModule } })
          }
        }

        return {
          ImportDeclaration(node) { reportCrossModuleImport(node, node.source) },
          ExportAllDeclaration(node) { reportCrossModuleImport(node, node.source) },
          ExportNamedDeclaration(node) { reportCrossModuleImport(node, node.source) },
          ImportExpression(node) { reportCrossModuleImport(node, node.source) },
        }
      },
    },
  },
}

function moduleLayerConfig(moduleName, layerName, restrictedPatterns) {
  return {
    files: [`src/modules/${moduleName}/${layerName}/**/*.{ts,tsx}`],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: restrictedPatterns,
      }],
    },
  }
}

const moduleBoundaryConfigs = moduleNames.flatMap((moduleName) => [
  moduleLayerConfig(moduleName, 'domain', [
    { group: ['react', 'react/*', 'react-router-dom', 'zustand', 'zustand/*', '**/data/**', '**/presentation/**', '**/infrastructure/**', '**/app/**', '**/di/**', '**/router/**'], message: 'Domain hanya boleh bergantung pada domain dan shared domain.' },
  ]),
  moduleLayerConfig(moduleName, 'data', [
    { group: ['**/presentation/**', '**/app/**', '**/di/**', '**/router/**'], message: 'Data tidak boleh bergantung pada layer di luar domain atau infrastructure.' },
  ]),
  moduleLayerConfig(moduleName, 'presentation', [
    { group: ['**/data/**', '**/app/**', '**/di/**', '**/router/**'], message: 'Presentation menerima operasi melalui props, bukan dari data, app, DI, atau router.' },
  ]),
  moduleLayerConfig(moduleName, 'router', [
    { group: ['**/app/**', '**/data/**', '**/di/**', '**/infrastructure/**'], message: 'Router modul hanya menyusun halaman dan operasi yang diberikan composition root.' },
  ]),
  moduleLayerConfig(moduleName, 'di', [
    { group: ['**/app/**', '**/presentation/**', '**/router/**'], message: 'DI modul merakit domain dan data, bukan UI atau app.' },
  ]),
])

export default defineConfig([
  globalIgnores(['dist', 'src/app/localization/generated/*.ts']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['src/shared/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{ group: ['react', 'react/*', 'zustand', 'zustand/*', '**/data/**', '**/presentation/**', '**/infrastructure/**', '**/app/**', '**/modules/**'], message: 'Shared domain tidak boleh bergantung pada UI, infrastructure, app, atau modul bisnis.' }],
      }],
    },
  },
  ...moduleBoundaryConfigs,
  {
    files: ['src/modules/**/*.{ts,tsx}'],
    plugins: { architecture: architecturePlugin },
    rules: { 'architecture/no-cross-module-imports': 'error' },
  },
  {
    files: ['src/app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: [
            '**/modules/*/data/**', '**/modules/*/domain/**', '**/modules/*/presentation/**',
            '**/modules/*/di/**', '**/modules/*/router/**',
          ],
          message: 'App hanya boleh memakai public API modul, bukan implementasi internalnya.',
        }],
      }],
    },
  },
  {
    files: ['src/shared/presentation/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{ group: ['**/modules/**', '**/app/**', '**/data/**', '**/infrastructure/**'], message: 'Komponen shared harus bebas dependensi modul dan app.' }],
      }],
    },
  },
  {
    files: ['src/infrastructure/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['**/modules/**', '**/app/**', '**/presentation/**', '**/router/**', '**/di/**'],
          message: 'Infrastructure tidak boleh bergantung pada UI, app, atau modul bisnis.',
        }],
      }],
    },
  },
])
