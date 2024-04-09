export default function getData({ oldData }) {
  const i18n = {
    name: 'i18n',
    importers: ["import i18n from './lang'",
  ],
    initializer: 'i18n'
  }

  return {
    ...oldData,
    // Append the i18n plugin right after the vue plugin
    plugins: [...oldData.plugins, i18n]
  }
}