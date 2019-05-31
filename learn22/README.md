# webpack4.0配置详细介绍

## 基本配置

下载`webpack-cli`

```
npm i webpack-cli -D
```

在src目录下创建`index.html` 和 `index.js`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
  <div class="app"></div>
  <script src="../dist/main.js"></script>
</body>
</html>
```

```js
document.querySelector('.app').innerHTML = 'Hello';
```

从webpack4.0开始，可以不需要配置文件，运行

```
npx webpack src/index.js
```

会自动在`dist`文件夹下生成`main.js`

`npx` 命令会调用项目内部安装的模块，会到`node_modules/.bin`路径和环境变量`$PATH`里面，检查命令是否存在。 或者在`package.json`中添加scripts,运行 **npm run build** 也有同样的效果

```json
{
  "scripts": {
    "build": "webpack src/index.js"
  },
}
```

在常规项目中，我们还是得需要配置文件，webpack默认的配置文件名为`webpack.config.js`，也可以自定义文件名，运行

```
webpack --config xxx.js
```

创建`webpack.config.js`

```js
const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    main: './src/index.js',
  },
  output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist')
	}
}
```

### mode

`mode`配置项，可选有`development` `production`，代表生产环境跟开发环境。`production`下打包出来的代码会自动压缩。

具体2种模式差异可以看官方的[mode文档](https://www.webpackjs.com/concepts/mode/)

### entry

`entry`配置入口文件，可以是字符串，也可以是对象，两者是等价的。

```js
module.exports = {
  mode: 'development',
  entry: './src/index.js',
}
```
```js
module.exports = {
  mode: 'development',
  entry: {
    main: './src/index.js',
  },
}
```
同时也可以创建多个入口

```js
module.exports = {
  mode: 'development',
  entry: {
    main: './src/index.js',
    a: './src/a.js',
    b: './src/b.js',
  },
}
```

### output

`output`配置出口，传入一个对象

```js
module.exports = {
  output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist')
	}
}
```

`filename`表示打包文件的文件名，其中`[name]`是webpack的占位符，表示名字与入口文件名相同。

webpack中常见的占位符有多种，常见的如下：

* [name] :代表打包后文件的名称，在entry或代码中(之后会看到)确定
* [id] :webpack给块分配的内部chunk id，如果你没有隐藏，你能在打包后的命令行中看到；
* [hash] ：每次构建过程中，生成的唯一 hash 值;
* [chunkhash] : 依据于打包生成文件内容的 hash 值,内容不变，值不变；
* [ext] : 资源扩展名,如js,jsx,png等等;

`path`则表示输出路径。

## loader

webpack不仅可以打包js文件，还可以打包样式文件，图片，字体文件，只要添加对应的loader配置。

### style-loader/css-loader/sass-loader

`style-loader`与`css-loader`是用来打包样式文件。首先安装

```
npm i style-loader css-loader -D
```

在`webpack.config.js`中添加loader配置

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      }
    ]
  }
}
```

webpack允许配置中指定多个loader，写在`rules`数组中。`test`正则匹配对应的文件，这里配置后缀是`xx.css`文件。`use`中可以使用一个或多个loader,顺序是从下到上，从右到左。

创建`style.css`,并引入

```css
.app {
  width: 100px;
  height: 100px;
  background: #000;
}
```

```js
import './style.css';

document.querySelector('.app').innerHTML = 'Hello';
```

打包，打开`index.html`就可以看到css已经生效。其中`css-loader`来处理`@import` 和 `url() `会 `import/require()` 后再解析(resolve)它们。`style-loader`则会创建`style`节点，加入css样式，通过js内联到index.html中。

项目中也常常用到css预编译器，如`sass`、`less`、`stylus`，这里以我常用的`sass`为例,下载依赖

```
npm i node-sass sass-loader -D
```

添加loader

```js
const path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(sa|c|sc)ss$/,
        use: [ 'style-loader', 'css-loader', 'sass-loader' ]
      }
    ]
  }
}
```

创建`style.scss`并引入

```scss
body {
  .app {
    width: 100px;
    height: 100px;
    background: #000;
  }
}
```

### postcss-loader

下载`postcss-loader`

```
npm i postcss-loader -D
```

添加loader

```js
const path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(sa|c|sc)ss$/,
        use: [ 'style-loader', 'css-loader', 'postcss-loader', 'sass-loader' ]
      }
    ]
  }
}
```
添加postcss配置文件，同级目录下新建`.postcssrs.js`

**autoprefixer**

autoprefixer能解析css并且为其添加浏览器厂商前缀的PostCSS插件，是一款常用PostCSS插件。

```
npm i autoprefixer -D
```

在`.postcssrs.js`中添加插件

```js
module.exports = {
  "plugins": {
    "autoprefixer": {
      browsers: [
        "> 0.01%"
      ]
    },
  }
}
```

**postcss-pxtorem**

开发移动端项目，用rem适配时，常会用到将px转换为rem插件。

在`.postcssrs.js`中添加插件

```js
module.exports = {
  "postcss-pxtorem": {
    rootValue: 75, // 75px => 1rem
    unitPrecision: 3, // 保留后3位小数
    propList: ['*', '!border*'], // 转换列表，不包含border
    selectorBlackList: ["cube"] // 黑名单，包含cube的类，不编译第三方ui库
  },
}
```

**purgecss**

`purgecss`可以检测去除不必要的css样式，这里简单介绍下配合postcss的配置

下载postcss插件

```
npm i @fullhuman/postcss-purgecss -D
```

添加配置

```js
module.exports = {
  "plugins": {
    '@fullhuman/postcss-purgecss': {
      content: ['index.html', '**/*.js', '**/*.html', '**/*.vue'], // 需要检测的文件路径
      whitelist: ["html", "body"], // 白名单
      whitelistPatterns: [], // 正则匹配白名单
    },
  }
}
```

但是在多数人反馈，去除多余css并不容易。动态插入的class是无法解析，只能依赖白名单防止动态插入的类名被过滤。所以是否使用`purgecss`还得看具体场景，项目维护成本。


### file-loader/url-loader

`file-loader`是用来打包文件返回其公共URL，如图片字体等。`url-loader`在`file-loader`打包文件的基础上，又增加了可以指定文件大小，小文件则会返回DataURL。


下载`url-loader`

```
npm i url-loader -D
```

添加配置文件的rules，针对图片文件（后缀为png、jpg、gif）进行处理，设置limit为8192表示8kb以下的图片将打包成DataURL。处理字体等文件同理。

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192
            }
          }
        ]
      }
    ]
  }
}
```

### babel

现在的开发环境中，es6语法简洁可读性强，已经是必不可少的。但是在大部分浏览器中并不能兼容es6,而babel可以帮助我们将es6转换为es5。

首先下载`babel-loader` `babel-core`

```
npm i babel-loader @babel/core -D
```

在`webpack.config.js`添加配置

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      }
    ]
  },
}
```

下载`@babel/preset-env`

```
npm i @babel/preset-env -D
```

添加`options`

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          "presets": ["@babel/preset-env"]
        }
      }
    ]
  },
}
```

可以新增一个babel配置文件`.babelrc`

```json
{
  "presets": ["@babel/preset-env"]
}
```

添加es6语法，打包

```js
// index.js

class A {
  constructor() {
    console.log('test class')
    this.list = [1,2,3,4];
  }

  mapArray() {
    this.list.map(item => {
      console.log(item);
    });
    console.log(this.list.includes(1));
  }
}

const a = new A();
a.mapArray();
```

但是babel默认只转换js语法，而不转换新的API，比如Iterator、Generator、Set、Maps、Proxy、Reflect、Symbol、Promise等全局对象，以及一些定义在全局对象上的方法（比如Object.assign）都不会转码。例如上述es6在Array对象新增的`includes`方法，就不会被转换。所以这里必须要配合`babel-polyfill`

```
npm i @babel/polyfill -S
```

这里可以在你的业务代码中`require("@babel/polyfill")`，也可以在`webpack.config.js`入口中配置

```js
module.exports = {
  entry: {
    main: ['@babel/polyfill', './src/index.js']
  },
}
```

打包后发现`main.js`从原来的35KB变成485KB，`@babel/polyfill`被完全引入。

所以我们可以按需加载polyfill,修改`.babelrc`,添加`useBuiltIns`配置

```json
{
  "presets": [
    ["@babel/preset-env", {
      "useBuiltIns": "usage"
    }]
  ]
}
```

`useBuiltIns`默认为`false`，可选有三种

* `false`: 不对polyfills做任何操作
* `entry`: 根据target中浏览器版本的支持，将polyfills拆分引入，仅引入有浏览器不支持的polyfill
* `usage`: 检测代码中ES6/7/8等的使用情况，仅仅加载代码中用到的polyfills

打包后，`main.js`的体积变为72KB

polyfill会修改全局作用，比如像Promise这样的新类就是挂载在全局上的，这样就会污染了全局命名空间。在打包一些第三方库打包时，会配合使用`transform-runtime`

```
npm i @babel/plugin-transform-runtime -D
```

```
npm i @babel/runtime -S
```

配置`.babelrc`

```json
{
  "plugins": ["@babel/plugin-transform-runtime"]
}
```

可配置选项

```json
{
  "plugins": [
    [
      "@babel/plugin-transform-runtime",
      {
        "corejs": false,
        "helpers": true,
        "regenerator": true,
        "useESModules": false
      }
    ]
  ]
}
```







## Plugins

webpack 有着丰富的插件接口(rich plugin interface)。webpack 自身的多数功能都使用这个插件接口。这个插件接口使 webpack 变得极其灵活。

### ExtractTextWebpackPlugin

在js中引入css，打包后会将样式内嵌到js bundle中，当js过大加载比较慢时，样式无法及时展示，导致网站排版错乱闪烁。于是可以使用`ExtractTextWebpackPlugin`来分离引用到的`*.css`文件，把样式放到一个单独的css文件。

安装

```
npm i extract-text-webpack-plugin@next -D
```

> 这里使用最新的beta版，当前版本不支持webpack4，打包会出现Tapable.plugin is deprecated. Use new API on `.hooks` instead的错误

修改之前css loader的配置

```js
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(sa|c|sc)ss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'postcss-loader', 'sass-loader']
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("styles.css"),
  ]
}
```

最终在dist目录下打包分离出名为`styles.css`的样式文件。


### HtmlWebpackPlugin

之前是用自己手写的`index.html`文件，再引入dist目录下打包生成的`main.js`。如果在打包生成的js上带上hash，每次打包每次都要修改html引用的js，这未免太麻烦了。`HtmlWebpackPlugin`插件会帮你生成一个html文件，并且直接引用打包出来的js、css等文件

下载

```
npm i html-webpack-plugin -D
```

添加插件

```js
plugins: [
  new HtmlWebpackPlugin({
    filename: 'index.html', // 生成的html文件名
    template: './src/index.html', // 引用的html文件模板
  }),
]
```

去除`index.html`中引用的js

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
  <div class="app"></div>
  <!-- <script src="../dist/main.js"></script> -->
</body>
</html>
```

打包后，在dist目录下会生成`index.html`的文件，里面已经自动link打包出来的样式文件以及引入main.js（这里加入了hash作为区别）

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
<link href="styles.css" rel="stylesheet"></head>
<body>
  <div class="app"></div>
  <!-- <script src="../dist/main.js"></script> -->
<script type="text/javascript" src="main.f63089c7eac9c487ee21.js"></script></body>
</html>
```

这里再介绍下其他配置

#### inject

inject有四个值 `true` `body` `head` `false`

* `true` 默认值，script标签位于html文件的 body 底部
* `body` script标签位于html文件的 body 底部
* `head` script标签位于html文件的 head中
* `false` 不插入生成的js文件

#### favicon

给你生成的html文件生成一个 `favicon` ,值是一个路径

```js
plugins: [
  new HtmlWebpackPlugin({
      favicon: './favicon.ico'
  }) 
]
```

生成的html文件会添加

```html
<link rel="shortcut icon" href="favicon.ico">
```

#### minify

`minify`是用来配置html压缩，`html-webpack-plugin`内部集成了 [`html-minifier`](https://github.com/kangax/html-minifier)

```js
// vue-cli中的html-webpack-plugin配置

new HtmlWebpackPlugin({
  minify: {
    removeComments: true, // 移除注释
    collapseWhitespace: true, // 移除空格
    removeAttributeQuotes: true // 移除属性的引号
    // more options:
    // https://github.com/kangax/html-minifier#options-quick-reference
  },
}),
```

#### chunks

chunks主要用于多入口文件，当你有多个入口文件，那就回编译后生成多个打包后的文件，那么chunks 就能选择你要使用那些js文件

```js
module.exports = {
  entry: {
    main: './src/index.js',
    a: './a.js',
    b: './b.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['main', 'b'], // 排除a
    }),
  ]
}
```

### ProvidePlugin

在业务开发中，我们可能会频繁地用到类似`jquery`等类库。对此可以使用webpack自带的定义全局变量的插件`ProvidePlugin`

```js
module.exports = {
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery'
    }),
  ]
}
```

这样当使用到`$`变量时，webpack会帮你自动添加

```js
import $ from 'jquery';
```


## devServer

webpack可以通过`webpack-dev-server`开启热更新，增加开发效率

下载`webpack-dev-server`

```
npm i webpack-dev-server -D
```

在package.json中添加脚本

```json
"scripts": {
  "dev": "webpack-dev-server"
},
```

配置`webpack.config.js`，添加devServer

```js
module.exports = {
  devServer: {
    contentBase: path.join(__dirname, "dist"), // 目录
    compress: true, // 是否开启gzip压缩
    port: 8080, // 端口
    open: true // 是否开启浏览器
  },
}
```

最后运行`npm run dev`命令就可以开启热更新

在开发中，当修改代码，文件发生变化，就会刷新当前页面。但有时也会带来不便，比如更了css样式文件，也会刷新页面，于是可以开启模块热更新

修改devServer配置，添加webpack内置的`HotModuleReplacementPlugin`插件

```js
const webpack = require('webpack');

module.exports = {
  devServer: {
    contentBase: path.join(__dirname, "dist"), // 目录
    compress: true, // 是否开启gzip压缩
    port: 8080, // 端口
    open: true, // 是否开启浏览器
    hot: true, // 启用 webpack 的模块热更新
    hotOnly: true, // 失败也不会刷新页面
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
}
```

具体详情参考[webpack devServer API](https://www.webpackjs.com/configuration/dev-server/)

## 代码分割

假设我们在业务中用到了类似`jquery` `lodash` 等库，并且写了大量的业务代码，最后打包成一个`main.js`发布上线。但是由于功能迭代，业务代码也经常更新，用户只能一并下载更新包含各种类库的`main.js`。代码分割则可以让我们把类似`jquery` `lodash` `vue` `react` 等基本不会变动的库、框架与业务代码划分开来，这样业务的更新迭代，用户也只用更新含业务代码的文件即可。

在webpack4中，可以配置`optimization.splitChunks`开启代码分割功能。

在`webpack.config.js`中添加官网示例的配置

```js
module.exports = {
  //...
  optimization: {
    splitChunks: {
      chunks: 'all', // all: 所有 initial: 分割同步代码 async：分割异步代码
      minSize: 30000, // 大于30k则会分割代码
      maxSize: 0, // 超过最大文件体积则会再次分割代码
      minChunks: 1, // 至少被引用过1次
      maxAsyncRequests: 5, // 最多被分割次数
      maxInitialRequests: 3, // 入口文件最多分割次数
      automaticNameDelimiter: '~', // 文件名连接符
      name: true,
      cacheGroups: { // 分割同步代码的规则
        vendors: {
          test: /[\\/]node_modules[\\/]/, // 在node_modules文件下，代表第三方库
          priority: -10, // 优先级
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true // 检查相互依赖的模块，不会重复分割
        }
      }
    }
  }
};
```

在`index.js`中引入`jquery` 和 `ladash`，开始打包。之后在dist文件就会出现`vendors~main.hash.js`，里面则包含着`jquery` `ladash` 模块。

同时也可以支持异步代码分割，修改`index.js`

```js
import $ from 'jquery';

function useLoadsh() {
  import('lodash').then(_ => {
    console.log(_)
  });
}

useLoadsh();
```

打包之前添加babel插件支持动态导入文件

```
npm i babel-plugin-dynamic-import-webpack --D
```

配置 `.babelrc`

```js
{
  "plugins": ["dynamic-import-webpack"]
}
```

打包后在dist文件下，额外出现了`0.hash.js`文件，里面则是`lodash`模块，同时在`vendors~main.hash.js`文件里也不存在`lodash`内容。