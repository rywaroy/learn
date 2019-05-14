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