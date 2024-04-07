export default function getData({ oldData }) {
  const elementPlusPlugin = {
    name: 'antdVue',
    importers: [
      "import antdVue from 'ant-design-vue'",
      "import 'ant-design-vue/dist/reset.css'",
      "import * as antDIconsVue from '@ant-design/icons-vue'"
    ],
    initializer: 'antdVue'
  }

  return {
    ...oldData,
    // Append the antdVue plugin right after the vue plugin
    plugins: [...oldData.plugins, antdVuePlugin]
  }
}