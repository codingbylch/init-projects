# 使用说明
用于rollup打包js库，不用考虑兼容性；microbundle这个已经处理好兼容性，支持TS，详细使用请搜索该库。

当你的js库会用到Promise且需要兼容低版本浏览器，如IE11时，则使用：

```js
import 'promise-polyfill/src/polyfill'; 
```

这个库不到1kb，对比babel-polyfill好多了

package.json中的name将会被输出为umd格式的使用到，具体转为驼峰式。