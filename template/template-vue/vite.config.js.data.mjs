export default function getData() {
  return {
    plugins: [
      {
        name: 'vue',
        importer: "import vue from '@vitejs/plugin-vue'",
        initializer: 'vue()'
      }
    ]
  }
}
