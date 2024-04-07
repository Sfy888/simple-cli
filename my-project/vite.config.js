import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import Components from 'unplugin-vue-components/vite'

import {
  ElementPlusResolver,
  VueUseComponentsResolver
} from 'unplugin-vue-components/resolvers'
    

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    AutoImport({
      dts: 'types/auto-imports.d.ts',
      imports: [
        "vue",
        VueRouterAutoImports
      ],
      resolvers: [
        ElementPlusResolver()
      ]
    }),
    Components({
      dts: 'types/components.d.ts',
      dirs: ['src/components'],
      extensions: ['vue', 'md'],
      deep: true,
      directoryAsNamespace: false,
      globalNamespaces: [],
      directives: true,
      include: [/.vue$/],
      exclude: [/[\/]node_modules[\/]/, /[\/].git[\/]/],
      resolvers: [
        VueUseComponentsResolver(),
        ElementPlusResolver()
      ]
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})