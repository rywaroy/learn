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

`strict`设置`true`时，路由的匹配更加严格，尾部`/`是不可选的

```js
const router = new Router({
  strict: true
});

router.get('/a', async ctx => {
  ctx.body = 'a';
});

// localhost:8080/a => a
// localhost:8080/a/ => Not Found
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

## methods

`koa-router`引用了[methods](https://github.com/jshttp/methods)模块，其本质也是返回了`http.METHODS`对象，并对每个method进行小写处理。

```js
methods.forEach(function (method) {
  Router.prototype[method] = function (name, path, middleware) {
    var middleware;

    if (typeof path === 'string' || path instanceof RegExp) { // 判断是否传入了name参数
      middleware = Array.prototype.slice.call(arguments, 2);
    } else {
      middleware = Array.prototype.slice.call(arguments, 1);
      path = name;
      name = null;
    }

    this.register(path, [method], middleware, { // 注册路由
      name: name
    });

    return this;
  };
});

// Alias for `router.delete()` because delete is a reserved word
Router.prototype.del = Router.prototype['delete'];
```

遍历`methods`的快速构建Router原型上的method方法

```js
Router.prototype.get = function(){}
Router.prototype.post = function(){}
Router.prototype.del = function(){}

// ...
```
所以当我们调用`router.get()`时，实际上是注册了路由，并返回自身以便进行链式调用。

```js
router.get('/a', async ctx => {
  ctx.body = 'a';
});

router.register('/a', ['get'], [async ctx => {
  ctx.body = 'a'
}], { name: ull})
```

## register

```js
Router.prototype.register = function (path, methods, middleware, opts) {
  opts = opts || {};

  var router = this;
  var stack = this.stack;

  // support array of paths
  if (Array.isArray(path)) { // 判断路由是否是数组
    path.forEach(function (p) {
      router.register.call(router, p, methods, middleware, opts);
    });

    return this;
  }

  // create route
  var route = new Layer(path, methods, middleware, {
    end: opts.end === false ? opts.end : true,
    name: opts.name,
    sensitive: opts.sensitive || this.opts.sensitive || false,
    strict: opts.strict || this.opts.strict || false,
    prefix: opts.prefix || this.opts.prefix || "",
    ignoreCaptures: opts.ignoreCaptures
  });

  if (this.opts.prefix) { // 是否设置过路由前缀
    route.setPrefix(this.opts.prefix);
  }

  // add parameter middleware
  Object.keys(this.params).forEach(function (param) {
    route.param(param, this.params[param]);
  }, this);

  stack.push(route);

  return route;
};
```

原型上的`register`是用来注册路由的，首先是检查`path`是否是数组，如果是，则遍历`path`调用自身注册单个路由。

```js
router.register(['/a', ['/b', '/c']], ['get'], function(){})
```

所以当`path`是嵌套的数组时，会依次遍历分别注册`/a` `/b` `/c`三个路由。      

接着实例化`Layer`对象，判断是否设置过路由前缀，并调用实例上的`setPrefix`设置路由前缀。 然后设置针对某些参数的中间件处理， 再将`Layer`实例存放到`stack`路由栈中。

## Layer

```js
function Layer(path, methods, middleware, opts) {
  this.opts = opts || {};
  this.name = this.opts.name || null;
  this.methods = [];
  this.paramNames = [];
  this.stack = Array.isArray(middleware) ? middleware : [middleware]; // 中间件栈

  methods.forEach(function(method) {
    var l = this.methods.push(method.toUpperCase());
    if (this.methods[l-1] === 'GET') {
      this.methods.unshift('HEAD');
    }
  }, this);

  // ensure middleware is a function
  this.stack.forEach(function(fn) {
    var type = (typeof fn);
    if (type !== 'function') {
      throw new Error(
        methods.toString() + " `" + (this.opts.name || path) +"`: `middleware` "
        + "must be a function, not `" + type + "`"
      );
    }
  }, this);

  this.path = path;
  this.regexp = pathToRegExp(path, this.paramNames, this.opts);

  debug('defined route %s %s', this.methods, this.opts.prefix + this.path);
};
```

layer是负责存储路由监听的信息的，每次注册路由时的URL，URL生成的正则表达式，该URL中存在的参数，以及路由对应的中间件。

与`Router`的`stack`不同，这里的`stack`是存储路由中间件的。`methods`存储的是该路由监听对应的有效`METHOD`,可以看到，在存储过程中会先对`method`进行大小写转换，遇到`GET`请求时，会追加一个`HEAD`请求。最后利用`path-to-regexp`模块将路由转为正则表达式

### path-to-regexp

简单讲解下`path-to-regexp`模块

1. pathToRegexp

将路由转换成正则

```js
const pathToRegexp = require('path-to-regexp');

const re = pathToRegexp('/article/:id');
console.log(re);  // /^\/article\/((?:[^\/]+?))(?:\/(?=$))?$/i
```

2. exec

匹配 url 地址与规则是否相符

```js
const pathToRegexp = require('path-to-regexp');

const re = pathToRegexp('/article/:id');
const match1 = re.exec('/a/b');
const match1 = re.exec('/article/123');

console.log(match1); // null
console.log(match2); // [ '/article/123', '123', index: 0, input: '/article/123' ]
```

3. parse

解析 url 字符串中的参数部分(/:xxx)

```js
const pathToRegexp = require('path-to-regexp');

const url = '/article/:id';
console.log(pathToRegexp.parse(url));
```