export default function getData({ oldData }) {
  const antdPlugin = {
    name: 'antd',
    importers: [
      "import 'antd/dist/antd.css';",
      "import 'ant-design/dist/reset.css'",
    ],
  }

  return {
    ...oldData,
    // Append the antdVue plugin right after the vue plugin
    plugins: [...oldData.plugins, antdPlugin]
  }
}