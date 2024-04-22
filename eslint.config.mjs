import globals from 'globals'
import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js'

import path from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import pluginJs from '@eslint/js'

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({ baseDirectory: __dirname, recommendedConfig: pluginJs.configs.recommended })

export default [
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser
            },
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: 'module',
                project: ['./tsconfig.json']
            }
        }
    },
    ...compat.extends('standard-with-typescript'),
    pluginReactConfig,
    {
        rules: {
            quotes: ['error', 'single', { avoidEscape: true }],
            indent: ['error', 4],
            '@typescript-eslint/indent': ['error', 4]
        }
    },
    {
        ignores: ['build/*', 'node_modules/*', 'src/reportWebVitals.ts']
    }
]
