# 2018年 产品开发的一点点总结

> 2018年写了近一年的产品，总结一下各种规范、流程、奇技淫巧等等等

以下的内容都为个人习惯，并非标准，应该根据大家的喜好来，只供参考。

## html、css

写样式其实大多数都没有一个标准，每个人完成同一幅ui图可能都有各自的实现方式。但是大多数人最后趋近一个“标准”，一种最合理的布局方式。这当然比较依赖于开发经验。对于html来说，尽量多用html5新增标签（不考虑兼容低版本ie），header、footer、 nav (导航)、aside(侧栏)、article(文本区)、section(区域) 等, 多使用ul li p span等元素让页面看起来不全都是div。

移动端的布局上尽量使用flex布局，在flex的兼容上，基本支持现在的主流手机(pad)。在pc上需要ie10以上，所以pc目前还不推荐使用flex布局。

### css 命名规范

[`BEM`](https://juejin.im/post/5b925e616fb9a05cdd2ce70d)

我早在上家公司就推行`BEM`命名规范，但是由于规范`__` `--` `-` 斜杆太多又杂被大家嫌弃，甚至还被点名批评(...) 不过我倒是没有放弃，到第二家公司就主动使用这个规范了~

BEM规范在这里就不做详细介绍，点击链接看就可以了。来讲讲使用BEM规范中的一点点小问题。

1. 又臭又长的类名

在正式开发下，我们可能会遇到像`a__b__c__d-e-f--g`这类类名。这种情况下主要是因为dom嵌套层次太多，语义难以理解。这种情况需要在层级上做限制，不能超过多少级。我们的规范上是严格限定一级，多的层级要作为另一个块，如`a-b-c__d-e-f--g`。另外对于长单词，可以进行缩写来减小类名长度。

2. 书写麻烦

如果是使用了`less` `scss` 等css预处理，可以有以下的写法:

```less
.a {
  &-b {
    &__d {
      // ...
    }
    // ...
  }
  &__c {
    // ...
  }
}
```

不过在业务代码上，维护、修改css时不太直观，查询上述`a-b__d`类名需要一层一层找，不能直接搜索类名。

`SMACSS`

使用`SMACSS`对 CSS 进行了分层，增加了命名前缀。

* g-栅格
* f-原子类
* u-元件
* m-组件
* c-模块

其实我感觉蛮鸡肋的，至少我还没体会到它的好处。配合BEM使用几乎是不会有命名冲突。

另外有合理的命名规范存在，样式的层级就不能过高，一般最多2层。

```css
.a .b .c .b {
  display: block;
}
```

同时也尽量不使用标签名

```css
.a div {

}

.b span {

}
```

上述例子尽量不要出现。

### css文件结构

在项目的第一版时，style样式并没有写在`.vue`文件中的`style`中，这样显得各个页面、组件文件内容多，难以维护。最后项目组决定把所有的样式写入`src/asseets/css/style.css`中，并在`main.js`中引用。

```css
/* 模块1 */

.a {

}

/* 模块1 */

/* 模块2 */

.b {

}

/* 模块2 */
```

大概是这样。在第一版开发都比较完美，集中式管理所有的样式，修改也比较方便。但是问题出在后面的迭代上，因为只维护一个样式文件，包含了整站的样式，代码超过了四千行。无论再清楚的注释，再合理的规划，都难免显得非常冗杂难以管理。我并不能保证所有新增的样式都能写在对应模块的代码块中。

第二个非常严重的是，我的项目本身要向其他项目输出公用的组件，对于组件样式只能靠复制黏贴提取出来。一旦复制黏贴，其他的项目就大概率出现无用、重复的样式，令人非常难受。

在第一版后进行样式的重构，采用类似小程序的文件结构，资源的就近维护。

```bash
├── /MyComponent/
│   ├── MyComponent.vue
│   ├── /css/
│       ├── a.css
│       ├── b.css
│   ├── MyComponent.css
│   ├── /images/
│       ├── a.png
│       ├── b.png
```

多个样式文件可以放入`css`文件夹中。`MyComponent.vue`的`style`标签中引用`MyComponent.css`。这样保证不同组件的样式之间相互独立，易于维护。

### css书写规范

一开始我是在项目中加入`stylelint`样式检查的，不过后来嫌太麻烦，一点格式不对就直接报错，就直接去除掉了。但总体的书写规范都是基于`stylelint`规范。

```css
.a {
  display: block;
  background: rgba(0, 0, 0, .1);
}

/* 注释 */

.b {
  width: 100px;
  height: 100px;
}
```

样式与样式之间、与注释之间都有空行，类名与大括号直接有空格，属性名与值直接有空格，小数省略0等等。如果使用vscode编辑器开发的话，下载`Beautify`格式化插件，按下`command+B`快捷键就可以格式化代码。规则也跟这里的差不多，不过最后记得最后一个属性带上分号，`Beautify`是不会帮你添加的。

另外公司的样式规范提到，样式还分权重的，比如`display`要比`background`权重高（更重要），所以`display`要写在前面。不过这的确太严格了，没有5、6年写css的老司机估计都养不成这样的习惯，最后还是按大家喜好来吧，写多了自然就有了自己的规范了~

### 移动端适配

[链接](https://juejin.im/post/5c0dd7ac6fb9a049c43d7edc)

关于移动端适配已经有很多成熟的方案了，最主流的还是rem适配方案。

上家公司的rem计算如下

```js
var html = document.getElementsByTagName('html')[0];
var designFontSize = 100; // 比例
var designWidth = 750; // 设计稿宽度
var winWidth = document.documentElement.getBoundingClientRect().width; // document宽度

var fontSize = winWidth / designWidth * designFontSize;
html.style.fontSize = fontSize + 'px';
```

在750像素设计稿下`html`的`font-size`为`100px`。所以在设计稿，例如一个元素400像素宽度，就可以转换为`4rem`。

如今的计算方案更加粗暴，不依赖js计算，直接将`html`的`font-size`为`10vw`，也就是十分之一的屏幕宽度。这样在750像素设计稿下，一个元素75像素宽度，就可以转换为`1rem`。当然，100比例的rem转换是非常直观的，但是75的比例就不一定了。。。总不能随手携带计算器（设计稿改成1000像素）吧。

那工程化的东西来了，npm下载`postcss-px2rem`，配置`.postcssrc.js`

```js
module.exports = {
  "plugins": {
    "postcss-px2rem": { // 添加px2rem插件
      "remUnit": 75 // 1rem像素
    }
  }
}
```

使用`px2rem`转换px，style样式文件上保留设计稿像素。不过在部分安卓手机上`1px`表现得不好，1像素的边线可能看不到，所以不建议去转换1像素。可以设置忽略对应`border`转换，或者直接写成`1PX`。


## js

### js的书写规范

使用`eslint`，选择`airbnb`规范。在初始化`vue-cli`时，会提示是否使用`eslint`。或者自己也可以全局下载`eslint`进行配置。

```
npm i -g eslint

eslint -init
```

配置完成后可以在根目录下`.eslintrc.js`中，可以设置自定义规则。比如删除不习惯的规则。

```js
rules: {
  'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  'no-console': process.env.NODE_ENV === 'production' ? 2 : 0,
}
```

上述例子在生产环境下开启`no-debugger`和`no-console`。属性值可是是`0` `1` `2` `off` `warn` `error`

* `0` 和 `off` 表示关闭规则
* `1` 和 `warn` 表示打开规则，作为一个警告
* `2` 和 `error` 表示打开规则，作为一个错误

如果使用vscode编辑器，可以下载`ESLint`插件，配置了`eslint`就会在代码上出现波浪线的错误提示，并且显示具体的规则，非常方便。