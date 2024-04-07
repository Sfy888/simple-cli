export default function getData({ oldData }) {
  const antdVuePlugin = {
    name: 'antdVue',
    importers: [
      "import antdVue from 'ant-design-vue'",
      "import 'ant-design-vue/dist/reset.css'",
    ],
    initializer: 'antdVue'
  }

  return {
    ...oldData,
    // Append the antdVue plugin right after the vue plugin
    plugins: [...oldData.plugins, antdVuePlugin]
  }
}