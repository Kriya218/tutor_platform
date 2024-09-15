export default [
  {
    ignores: ['node_modules/*'],
    languageOptions: {
      ecmaVersion: 12, // 設置 ECMAScript 版本 (2021 即 12)
      sourceType: 'module', // 模塊系統，例如 ES 模塊或 CommonJS
      globals: {
        window: 'readonly', // 定義瀏覽器中的全域變數 (只讀)
        document: 'readonly',
        require: 'readonly', // CommonJS 中的 require (只讀)
        module: 'readonly'
      }
    },
    rules: {
      'arrow-parens': ['warn', 'as-needed']
    }
  }
]
