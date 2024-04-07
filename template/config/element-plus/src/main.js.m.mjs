export default function getData({ oldData }) {
  const elementPlusPlugin = {
    name: 'elementPlus',
    importers: ["import elementPlus from 'element-plus'", "import * as ElementPlusIconsVue from '@element-plus/icons-vue'", "import 'element-plus/dist/index.css'"
  ],
    initializer: 'elementPlus'
  }

  return {
    ...oldData,
    // Append the elementPlus plugin right after the vue plugin
    plugins: [...oldData.plugins, elementPlusPlugin]
  }
}