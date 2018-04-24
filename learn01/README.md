# 在webpack中使用stylelint

>公司要求在css样式文件中加入stylelint格式审查，并且公司项目基于vue-cli，搜集了一些stylelint的配置方法以及在vue-cli中stylelint-webpack-plugin插件的使用

## stylelint简介

stylelint 是一个基于 Javascript 的代码审查工具，它易于扩展，支持最新的 CSS 语法，也理解类似 CSS 的语法。此外，因为它是基于 JavaScript，所以比起 Ruby 开发的 scss-lint 速度更快。

stylelint 是一个强大和现代的 CSS 审查工具，有助于开发者推行统一的代码规范，避免样式错误。stylelint 由 PostCSS 提供技术支持，所以它也可以理解 PostCSS 解析的语法，比如 SCSS。


## stylelint 使用

* 安装

```bash
npm install -g stylelint
```

```bash
npm install stylelint-config-standard -S
```

* 在配置文件`.stylelintrc.js`中配置 (文件格式可以是`JSON`或者`YAML`)

```JavaScript
module.exports = {
  'extends': 'stylelint-config-standard', //继承第三方标准规范
  "rules": { //自定义规范
    "selector-list-comma-newline-after": null
  }
}
```

* 在`package.json`中加入npm脚本

```json
{
    "scripts": {
        "lintcss:vue": "stylelint **/*.vue --custom-syntax postcss-html",
        "lintcss": "stylelint **/*.css",
        "lintcss:scss": "stylelint **/*.scss"
    },
}
```

* 使用 

    * 审查指定样式文件（全局安装stylelint）

    ```
    stylelint style.css
    ```

    * 审查项目中所有样式文件

    ```
    npm run lintcss
    ```
    * 例子
        ```css
        .a{
                    width: 100px;
            height:     100px;
             background: red;
        }

        ```
        -结果

        ```bash
        style.css
        1:2   ✖  Expected single space before "{"     block-opening-brace-space-before
        2:9   ✖  Expected indentation of 2 spaces     indentation                     
        3:5   ✖  Expected indentation of 2 spaces     indentation                     
        3:12  ✖  Expected single space after ":"      declaration-colon-space-after   
                with a single-line declaration                                       
        4:6   ✖  Expected indentation of 2 spaces     indentation                     
        5:1   ✖  Unexpected missing end-of-source     no-missing-end-of-source-newline
                newline
        ```
    
## 在 vue-cli 中使用 stylelint-webpack-plugin 插件

* 安装

    ```
    npm install stylelint-webpack-plugin -S
    ```

* 配置 `webpack.dev.conf.js`

    ```JavaScript
    const StyleLintPlugin = require('stylelint-webpack-plugin');

    //...
    plugins:[
        new StyleLintPlugin({
            context: "src",
            configFile: '.stylelintrc.js',
            files: '**/*.css',
        }),
    ]
    ```

## 规则

* color

    * `color-hex-case` : 指定大写或小写十六进制的颜色
    * `color-hex-length` : 指定十六进制颜色长或短的符号
    * `color-named` : 需要（如果可能）或不允许命名的颜色
    * `color-no-hex` : 不允许十六进制的颜色
    * `color-no-invalid-hex` : 禁止无效的十六进制颜色

* font-family

    * `font-family-name-quotes` : 指定是否引号应该围绕字体系列名称中使用

* function

    * `function-blacklist` : 指定不允许的功能黑名单
    * `function-calc-no-unspaced-operator` : 计算的函数中禁止的unspaced执行
    * `function-comma-newline-after` : 要求一个新行或函数的逗号后禁止空白
    * `function-comma-newline-before` : 要求一个新行或函数的逗号之前不允许空白
    * `function-comma-space-after` : 要求一个空格或函数的逗号后禁止空白
    * `function-comma-space-before` : 要求一个空格或函数的逗号前禁止空白
    * `function-linear-gradient-no-nonstandard-direction` : 禁止在线性梯度方向值
    * `function-max-empty-lines` : 限制方法中相邻的空行数
    * `function-name-case` : 指定大写或小写的函数名
    * `function-parentheses-newline-inside` : 要求一个新行或函数的括号内不允许空白
    * `function-parentheses-space-inside` : 要求一个空格或函数的括号内不允许空白
    * `function-url-data-uris` : 要求或禁止数据的URI的URL
    * `function-url-no-scheme-relative` : 不允许文档相对的URL
    * `function-url-quotes` : 要求或禁止对于网址报价
    * `function-url-scheme-whitelist` : 指定允许URL方案的白名单
    * `function-whitelist` : 指定允许的功能的白名单
    * `function-whitespace-after` : 要求方法后不允许空白

* Number

    * `number-leading-zero` : 要求或分数低于1的数字禁止前导零
    * `number-max-precision` : 限制允许的小数位数的数目
    * `number-no-trailing-zeros` : 禁止在数量尾随零

* String

    * `string-no-newline` : 禁止在字符串（转义）换行
    * `string-quotes` : 指定字串，单或双引号

* Length

    * `length-zero-no-unit` : 禁止单位零长度

* Time

    * `time-no-imperceptible` : 禁止动画和过渡小于或等于100毫秒

* Unit

    * `unit-blacklist` : 指定不允许使用单位的黑名单
    * `unit-case` : 指定大写或小写的单位
    * `unit-no-unknown` : 禁止未知的单位
    * `unit-whitelist` : 指定允许单位的白名单

* Value

    * `value-keyword-case` : 指定大写或小写关键字的值
    * `value-no-vendor-prefix` : 不允许供应商前缀值

* Value list

    * `value-list-comma-newline-after` : 逗号后需要一个换行符或不允许空白值列表
    * `value-list-comma-newline-before` : 逗号前需要一个换行符或不允许空白值列表
    * `value-list-comma-space-after` : 需要一个空格或者逗号后不允许空白值列表
    * `value-list-comma-space-before` : 需要一个空格或者逗号前不允许空白值列表
    * `value-list-max-empty-lines` : 指定允许单位的白名单限制相邻的数量值列表内空行

* Custom property

    * `custom-property-empty-line-before` : 自定义属性之前equire或不允许空行
    * `custom-property-no-outside-root` : 不允许自定义属性以外的:根规则
    * `custom-property-pattern` : 为自定义属性指定一个模式

* Shorthand property

    * `shorthand-property-no-redundant-values` : 不允许在简写属性冗余值

* Property

    * `property-blacklist` : 指定一个不允许属性的黑名单
    * `property-case` : 为属性指定小写或大写
    * `property-no-unknown` : 不允许未知属性
    * `property-no-vendor-prefix` : 不允许前缀的属性
    * `property-whitelist` : 指定一个白名单允许属性

* Keyframe declaration

    * `keyframe-declaration-no-important` : 不允许!important在关键帧声明

* Declaration

    * `declaration-bang-space-after` : bang声明之后需要一个空格或者不允许空白
    * `declaration-bang-space-before` : bang声明之前需要一个空格或者不允许空白
    * `declaration-colon-newline-after` : 冒号后的声明需要一个换行符或不允许空白
    * `declaration-colon-space-after` : 冒号后的声明需要一个空格或不允许空白
    * `declaration-colon-space-before` : 冒号之前的声明需要一个空格或不允许空白
    * `declaration-empty-line-before` : 要求声明前不允许空一行
    * `declaration-no-important` : 不允许!important声明
    * `declaration-property-unit-blacklist` : 指定一个黑名单内不允许声明属性
    * `declaration-property-unit-whitelist` : 指定一个白名单内允许声明属性
    * `declaration-property-value-blacklist` : 指定一个黑名单,不允许在声明属性和值对
    * `declaration-property-value-whitelist` : 指定一个允许属性和值对声明的白名单

* Declaration block

    * `declaration-block-no-duplicate-properties` : 不允许复制属性块中声明
    * `declaration-block-no-ignored-properties` : 不允许被忽略是因为另一个属性值的属性值相同的规则
    * `declaration-block-no-redundant-longhand-properties` : 不允许手写属性,可以组合成一个简写属性
    * `declaration-block-no-shorthand-property-overrides` : 不允许简写属性覆盖相关手写属性声明块
    * `declaration-block-properties-order` : 声明块中指定的顺序属性
    * `declaration-block-semicolon-newline-after` : 要求一个换行符或不允许空白块分号后
    * `declaration-block-semicolon-newline-before` : 要求一个换行符或不允许空白块分号之前的声明
    * `declaration-block-semicolon-space-after` : 要求一个空间或不允许空白块分号后的声明
    * `declaration-block-semicolon-space-before` : 要求一个空间或不允许空白块分号之前的声明
    * `declaration-block-single-line-max-declarations` : 限制声明在一行声明块的数量
    * `declaration-block-trailing-semicolon` : 要求或不允许在声明块后面的分号

* Block

    * `block-closing-brace-empty-line-before` : 要求或不允许关闭括号前空一行
    * `block-closing-brace-newline-after` : 需要一个换行符或不允许关闭括号后的空白
    * `block-closing-brace-newline-before` : 需要一个换行符或不允许空白关闭括号前的块
    * `block-closing-brace-space-after` : 需要一个空间或不允许关闭括号后的空白块
    * `block-closing-brace-space-before` : 在关闭括号前的块需要一个空格或者不允许空白
    * `block-no-empty` : 不允许空块
    * `block-no-single-line` : 不允许单行块
    * `block-opening-brace-newline-after` : 开括号的块之后需要新的一行
    * `block-opening-brace-newline-before` : 开括号的块之后需要一个换行符或不允许空白
    * `block-opening-brace-space-after` : 开括号的块之后需要一个空格或不允许空白
    * `block-opening-brace-space-before` : 开括号的块之前需要一个空格或不允许空白

* Selector

    * `selector-attribute-brackets-space-inside` : 在括号里的属性选择器需要一个空格或者不允许空白
    * `selector-attribute-operator-blacklist` : 指定一个黑名单不允许属性的操作符
    * `selector-attribute-operator-space-after` : 需要一个空间或不允许空格后运营商在属性选择器
    * `selector-attribute-operator-space-before` : 需要一个空间或不允许空格内运营商之前属性选择器
    * `selector-attribute-operator-whitelist` : 指定一个属性允许运营商的白名单
    * `selector-attribute-quotes` : 需要或不允许引用属性值
    * `selector-class-pattern` : 指定一个模式类选择符
    * `selector-combinator-space-after` : 需要一个空间或不允许空格后的组合子选择器
    * `selector-combinator-space-before` : 需要一个空间或不允许空格前的组合子选择器
    * `selector-descendant-combinator-no-non-space` : 不允许的字符的后代组合子选择器进行技术改造
    * `selector-id-pattern` : 指定一个模式,id选择器
    * `selector-max-compound-selectors` : 在一个选择器里面限制复合选择器的数量
    * `selector-max-specificity` : 限制的特异性选择器
    * `selector-nested-pattern` : 指定一个模式选择器的规则嵌套规则
    * `selector-no-attribute` : 不允许属性选择器
    * `selector-no-combinator` : 不允许在选择器组合
    * `selector-no-id` : 不允许id选择器
    * `selector-no-qualifying-type` : 不允许符合条件的选择器的类型
    * `selector-no-type` : 不允许类型选择器
    * `selector-no-universal` : 不允许通用选择器
    * `selector-no-vendor-prefix` : 不允许选择器的前缀
    * `selector-pseudo-class-blacklist` : 指定一个黑名单禁止伪类选择器
    * `selector-pseudo-class-case` :  为伪类选择器指定小写或大写
    * `selector-pseudo-class-no-unknown` : 不允许未知的伪类选择器
    * `selector-pseudo-class-parentheses-space-inside` : 需要一个空格或不允许空格在括号里面的伪类选择器
    * `selector-pseudo-class-whitelist` : 伪类选择器允许指定一个白名单
    * `selector-pseudo-element-case` : 为伪元素选择器指定小写或大写
    * `selector-pseudo-element-colon-notation` : 为适用的伪元素指定单引号或双冒号符号
    * `selector-pseudo-element-no-unknown` : 不允许未知的伪元素选择器
    * `selector-root-no-composition` : 在选择器不允许根的构成
    * `selector-type-case` : 指定小写或大写类型选择器
    * `selector-type-no-unknown` : 不允许未知类型选择器
    * `selector-max-empty-lines` : 限制内相邻的空行选择器的数量

* Selector list

    * `selector-list-comma-newline-after` : 需要一个换行符或不允许空白选择逗号后的列表
    * `selector-list-comma-newline-before` : 逗号前需要一个换行符或不允许空白选择器列表
    * `selector-list-comma-space-after` : 需要一个空格或者逗号后不允许空格选择器列表
    * `selector-list-comma-space-before` : 需要一个空格或者逗号前不允许空格选择器列表

* Root rule

    * `root-no-standard-properties` : 根规则内不允许标准属性

* Rule

    * `rule-nested-empty-line-before` : 需要或不允许嵌套规则前空一行
    * `rule-non-nested-empty-line-before` : 需要或不允许non-nested规则前空一行

* Media feature

    * `media-feature-colon-space-after` : 需要一个空间或不允许空格在冒号之后媒体的特性
    * `media-feature-colon-space-before` : 需要一个空间或不允许空格在冒号之前媒体的特性
    * `media-feature-name-case` : 为媒体特性名称指定小写或大写
    * `media-feature-name-no-unknown` : 不允许未知的媒体功能的名字
    * `media-feature-name-no-vendor-prefix` : 不允许媒体特性名称的前缀
    * `media-feature-no-missing-punctuation` : 不允许标点non-boolean媒体功能
    * `media-feature-parentheses-space-inside` : 需要一个空间或不允许空格在括号里面的媒体功能
    * `media-feature-range-operator-space-after` : 需要一个空间或不允许空白范围运算符后媒体的特性
    * `media-feature-range-operator-space-before` : 之前需要一个空间或不允许空格符范围在媒体功能

* Custom media

    * `custom-media-pattern` : 为定制媒体查询名称指定一个模式

* Media query list

    * `media-query-list-comma-newline-after` : 需要一个换行符或不允许空格后媒体查询的逗号分隔列表
    * `media-query-list-comma-newline-before` : 需要一个换行符或不允许空格之前媒体查询的逗号分隔列表
    * `media-query-list-comma-space-after` : 需要一个空间或不允许空格后媒体查询的逗号分隔列表
    * `media-query-list-comma-space-before` : 需要一个空间或不允许空格之前媒体查询的逗号分隔列表-nested规则前空一行

* At-rule

    * `at-rule-blacklist` : 不允许at-rules指定一个黑名单
    * `at-rule-empty-line-before` : 需要或不允许at-rules前空一行
    * `at-rule-name-case` : 指定at-rules小写或大写的名字
    * `at-rule-name-newline-after` : at-rule名称后需要一个换行符
    * `at-rule-name-space-after` : 需要一个空格后at-rule名称
    * `at-rule-no-unknown` : 不允许at-rules不明
    * `at-rule-no-vendor-prefix` : 不允许at-rules前缀
    * `at-rule-semicolon-newline-after` : 需要一个换行符之后at-rules的分号
    * `at-rule-whitelist` : 指定允许at-rules的白名单

* stylelint-disable comment

    * `stylelint-disable-reason` : 需要一个理由stylelint-disable之前或之后的评论发表评论

* Comment

    * `comment-empty-line-before` : 需要或不允许评论之前一个空行
    * `comment-no-empty` : 不允许空的评论
    * `comment-whitespace-inside` : 需要或不允许空格里面的注释标记
    * `comment-word-blacklist` : 指定一个黑名单内不允许的话评论

* General / Sheet

    * `indentation` : 指定缩进
    * `max-empty-lines` : 限制数量的相邻的空行
    * `max-line-length` : 限制线的长度
    * `max-nesting-depth` : 限制的深度嵌套
    * `no-browser-hacks` : 不允许浏览器黑客,无关你目标的浏览器
    * `no-descending-specificity` : 不允许选择器之后覆盖选择器的低特异性更高的特异性
    * `no-duplicate-selectors` : 不允许重复的选择器
    * `no-empty-source` : 不允许空的来源
    * `no-eol-whitespace` : 不允许行尾空白
    * `no-extra-semicolons` : 不允许额外的分号
    * `no-indistinguishable-colors` : 不允许产品极其接近的颜色相同
    * `no-invalid-double-slash-comments` : 不允许双斜杠注释(/ /…)不支持CSS
    * `no-missing-end-of-source-newline` : 不允许丢失end-of-source换行
    * `no-unknown-animations` : 不允许动画名称不对应@keyframes声明
    * `no-unsupported-browser-features` : 不允许功能的浏览器不支持的目标