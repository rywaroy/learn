# koa-router源码解析

`koa-router`是一款为了koa设计的路由中间件，如果没有合理的路由管理，我们可能要在koa中间件上分别对`ctx.url`进行判断，做对应的操作。`koa-router`可以帮我们管理路由，并且支持`get``post`等等http请求。具体可见[koa-router文档](https://github.com/alexmingoia/koa-router/tree/master/#koa-router)

简单例子

```js
var Koa = require('koa');
var Router = require('koa-router');

var app = new Koa();
var router = new Router(); // 创建koa实例

router.get('/a', (ctx, next) => { // 注册路由
  ctx.body = 'a';
});

app
  .use(router.routes()) // 添加中间件
  .use(router.allowedMethods()); // 添加针对OPTIONS的响应处理，以及一些METHOD不支持的处理

app.listen(8080);

// localhost:8080/a => a
```

`koa-router`的源码并不复杂，仅有`router.js`和`layer.js`构成。`router`提供了路由的注册，处理路由的中间件，整合layer并检查匹配的路由调用对应的layer。`layer`主要是对单个路由的处理，储存对应的路径、请求方法、路由匹配方法、路由参数、中间件等。

## 创建实例

```js
function Router(opts) {
  if (!(this instanceof Router)) {
    return new Router(opts);
  }

  this.opts = opts || {};
  this.methods = this.opts.methods || [
    'HEAD',
    'OPTIONS',
    'GET',
    'PUT',
    'PATCH',
    'POST',
    'DELETE'
  ];

  this.params = {};
  this.stack = []; // 
};
```

`Router`可以接收一个对象作为配置项

```js
opt = {
  methods: null, // http请求方法
  prefix: null, // 路由前缀
  sensitive: false, // 是否严格匹配大小写
  strict: false, // 允许可选的尾部分隔符匹配
  routerPath: null // 定义路由
}
```

其中`prefix`可以设置统一的路由前缀, 比如api版本

```js
const router = new Router({
  prefix: '/api/v1'
});

// localhost:8080/a => Not Found
// localhost:8080/api/v1/a => a
```

`sensitive` `strict` 最后会被传入 url正则模块`path-to-regexp`

`sensitive`设置`true`时，会验证大小写

```js
const router = new Router({
  sensitive: true
});

router.get('/a', async ctx => {
  ctx.body = 'a';
});

// localhost:8080/a => a
// localhost:8080/A => Not Found
```


设置了`routerPath`，任何请求都会转发到`routerPath`的路由上

```js
const router = new Router({
  routerPath: '/b'
});

router.get('/a', async ctx => {
  ctx.body = 'a';
});

router.get('/b', async ctx => {
  ctx.body = 'b';
});

// localhost:8080/a => b
// localhost:8080/b => b
```



