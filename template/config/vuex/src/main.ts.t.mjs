export default function getData({ oldData }) {
  const store = {
    name: 'Store',
    importers: ["import store from './store';"
  ],
    initializer: 'store'
  }

  return {
    ...oldData,
    // Append the store plugin right after the vue plugin
    plugins: [...oldData.plugins, store]
  }
}