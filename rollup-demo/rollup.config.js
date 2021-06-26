import path from "path";
import { terser } from "rollup-plugin-terser"; // 提供压缩后的输出文件
import resolve from "@rollup/plugin-node-resolve"; // 可处理导入使用 NPM 安装的模块
import commonjs from "@rollup/plugin-commonjs"; // 将 CommonJS 模块 转换为 ES2015 形式
import json from "@rollup/plugin-json"; // 允许 Rollup 从 JSON 文件导入数据
import babel from "@rollup/plugin-babel"; // babel转译，ES6转低版本
import buble from "@rollup/plugin-buble"; // 将ES6+代码编译成ES2015标准
import typescript from "@rollup/plugin-typescript"; // typescript，用这个都不用babel进行转译了，神奇

const extensions = [".js", ".ts", ".tsx"];
const getPath = (_path) => path.resolve(__dirname, _path);

export default {
  //   external: [
  //     // 不会被打包进来的，只会作为外部文件使用
  //     "some-externally-required-library",

  //   ],
  input: "src/index.ts",
  output: [
    {
      file: "dist/bundle.js",
      format: "umd",
      name: "iifeFuncName",
      plugins: [],
    },
    {
      file: "dist/bundle.min.js",
      format: "umd",
      name: "iifeFuncName",
      plugins: [terser()], // 输出插件
    },
  ],
  plugins: [
    json(),
    resolve({ jsnext: true, preferBuiltins: true, browser: true }),

    commonjs(),
    // buble(),
    typescript(),
    // babel({
    //   babelHelpers: "bundled",
    //   exclude: ["node_modules/**"],
    //   extensions: [".js", ".jsx", ".es6", ".es", ".mjs", ".ts"],
    // }),
    
  ],
};
