import { defaultNamingConventionRules, hope } from "eslint-config-mister-hope";

export default hope(
  {
    ignores: [
      "packages/*/lib/**",
      "packages/*/src/lib/**",
      "**/.vuepress/snippets/",
      "**/__tests__/__fixtures__/**",
      "**/*.bench.ts",
    ],

    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: [".markdownlint-cli2.mjs", "eslint.config.js"],
        },
      },
    },

    ts: {
      "@typescript-eslint/naming-convention": [
        "warn",

        // allow property starting with `@`
        {
          selector: ["property"],
          filter: {
            regex: "^@",
            match: true,
          },
          format: null,
        },

        // allow locales path like `/zh/`
        {
          selector: ["property"],
          filter: {
            regex: "(?:^@|^/$|^/.*/$)",
            match: true,
          },
          format: null,
        },

        // allow css property like `line-width`
        {
          selector: ["property"],
          filter: {
            regex: "^[a-z]+(?:-[a-z]+)*?$",
            match: true,
          },
          format: null,
        },

        ...defaultNamingConventionRules,
      ],
      "no-console": "off",
    },
  },
  {
    files: ["packages/*/src/**/*.ts"],
    rules: {
      "no-restricted-syntax": [
        "warn",

        // --- 解构 (Destructuring) ---
        {
          selector: "ObjectPattern",
          message:
            "【性能禁止】对象解构涉及属性查找、null检查和临时对象分配。请直接访问属性 (obj.prop)。",
        },
        {
          selector: "ArrayPattern",
          message: "【性能禁止】数组解构会触发迭代器协议。请直接使用索引访问 (arr[i])。",
        },

        // --- 展开运算符 (Spread) ---
        {
          selector: "SpreadElement",
          message:
            "【性能禁止】Spread操作符 (...obj/arr) 会导致浅拷贝和迭代，产生大量垃圾回收(GC)。请使用 Object.assign 或 slice/concat。",
        },

        // --- 循环 (Loops) ---
        {
          selector: "ForOfStatement",
          message:
            "【性能禁止】for-of 循环依赖迭代器协议，开销远高于传统 for 循环。请使用 for(let i=0; i<len; i++)。",
        },

        // --- 昂贵的 Object 方法 ---
        {
          selector: "CallExpression[callee.object.name='Object'][callee.property.name='entries']",
          message:
            "【性能禁止】Object.entries() 会创建 [[k,v], [k,v]] 大量临时数组，造成巨大 GC 压力。请使用 for-in 或 Object.keys() + 循环。",
        },
        {
          selector: "CallExpression[callee.object.name='Object'][callee.property.name='values']",
          message: "【性能禁止】Object.values() 会创建临时数组。请使用 for-in 或 Object.keys()。",
        },
        {
          selector: "CallExpression[callee.object.name='Object'][callee.property.name='from']",
          message: "【性能禁止】Object.from() 涉及迭代器和数组分配。请手动循环构建。",
        },

        // --- 循环内的危险操作 (针对热点路径) ---
        // 禁止在循环里定义函数 (闭包开销)
        {
          selector:
            "ForStatement FunctionDeclaration, ForStatement ArrowFunctionExpression, WhileStatement FunctionDeclaration, WhileStatement ArrowFunctionExpression",
          message: "【性能禁止】不要在循环内声明函数，这会重复分配闭包内存。请提取到循环外部。",
        },
        // 禁止在循环里 new RegExp
        {
          selector: [
            // 1. 禁止在普通函数内使用正则字面量 /.../
            "FunctionDeclaration Literal[regex]",

            // 2. 禁止在箭头函数内使用正则字面量
            "ArrowFunctionExpression Literal[regex]",

            // 3. 禁止在函数表达式内使用正则字面量 (const foo = function() {})
            "FunctionExpression Literal[regex]",

            // 4. 禁止在普通函数内 new RegExp
            "FunctionDeclaration NewExpression[callee.name='RegExp']",

            // 5. 禁止在箭头函数内 new RegExp
            "ArrowFunctionExpression NewExpression[callee.name='RegExp']",

            // 6. 禁止在函数表达式内 new RegExp
            "FunctionExpression NewExpression[callee.name='RegExp']",
          ].join(", "),
          message: "【性能禁止】不要在循环内编译正则。请在模块顶层声明 const REGEX = /.../;",
        },

        {
          selector:
            "CallExpression[callee.property.name=/^(map|filter|reduce|forEach|find|some|every)$/]",
          message:
            "【性能禁止】热点路径禁止使用数组高阶方法(.map/.filter等)，会产生中间数组或回调开销。请改用 for 循环。",
        },
      ],
    },
  },
);
