# koa 源码分析

## 基础

先简单了解下关于noded的http模块

```js
const http = require('http');
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});
server.listen(1234);
```

node的http模块主要负责了node对HTTP处理的封装,以上代码启动了一个监听1234端口的服务，返回Hello World。每次收到新的请求时，调用回调函数，`req` 和 `res`分别是请求的实体和返回的实体，操作req可以获取收到的请求，操作res对应的是将要返回的packet。

[koa api](https://koa.bootcss.com/)

## koa的整体架构

[koa](https://github.com/koajs/koa)的源码非常简单，放置在`lib`目录下，有`application.js` `context.js` `request.js` `response.js` 4个文件。 application 是 koa的入口文件，context 创建ctx上下文对象， request 和 response 是对req 和 res 对象的封装。

用官网的例子启动一个服务

```js
const Koa = require('koa');
const app = new Koa();

app.use(async ctx => {
  ctx.body = 'Hello World';
});

app.listen(3000);
```

## 剖析

### application 

```js
module.exports = class Application extends Emitter {
  constructor() {
    super();
    this.proxy = false;  // 代理设置
    this.middleware = []; // 中间件
    this.subdomainOffset = 2; // 子域名偏移设置
    this.env = process.env.NODE_ENV || 'development'; // node 环境变量
    this.context = Object.create(context);
    this.request = Object.create(request);
    this.response = Object.create(response);
    if (util.inspect.custom) {
      this[util.inspect.custom] = this.inspect;
    }
  }
}
```

`application.js` 里暴露了一个 `Application`的类， new Koa() 实际上是创建了一个Application的实例对象，Application又是继承于EventEmitter，所以koa的实例对象是可以使用 `on` , `emit`等方法来进行事件监听。

在 Application 的构造函数中，初始化了几个重要属性，proxy 属性是代理设置, middleware 属性是中间件数组, 用于存储中间件函数的, subdomainOffset 属性是子域名偏移量。

### listen

在例子中 调用 app.listen(3000) 来启动服务

```js
listen(...args) {
  debug('listen');
  const server = http.createServer(this.callback());
  return server.listen(...args);
}
```

源码中的 `listen` 函数本质是通过node http模块建立的服务， 然后使用 `callback`函数作为 http服务的回调函数。

### callback

```js
callback() {
  const fn = compose(this.middleware);
  // 如果没有对 error 事件进行监听, 那么绑定 error 事件监听处理
  if (!this.listenerCount('error')) this.on('error', this.onerror);
  // handleRequest 函数相当于 http.creatServer 的回调函数, 有 req, res 两个参数, 代表原生的 request, response 对象.
  const handleRequest = (req, res) => {
    const ctx = this.createContext(req, res); // 每次接受一个新的请求就是生成一次全新的 context
    return this.handleRequest(ctx, fn);
  };

  return handleRequest;
}
handleRequest(ctx, fnMiddleware) {
  const res = ctx.res;
  res.statusCode = 404;
  const onerror = err => ctx.onerror(err); // 错误处理
  const handleResponse = () => respond(ctx); // 响应处理
  onFinished(res, onerror); // 为 res 对象添加错误处理响应, 当 res 响应结束时, 执行 context 中的 onerror 函数(这里需要注意区分 context 与 koa 实例中的 onerror)
  return fnMiddleware(ctx).then(handleResponse).catch(onerror); // 执行中间件数组所有函数, 并结束时调用 respond 函数
}
```

callback中，先用`compose`函数处理了中间件，这在[koa 中间件机制](https://github.com/rywaroy/learn/tree/master/learn12)中讲过，这里不做深究。 然后进行了错误监听，使用`createContext`函数封装了node http原生`req` `res`对象，返回了`context`，最后返回`handleRequest`函数。

在`handleRequest`中，接收了`context`对象和`fnMiddleware`, 传入的`fnMiddleware`函数其实是在准备阶段整合过的中间件，它会安装顺序执行或者通过next把执行权提前交给下一个中间件，直到执行玩所有中间件，最后返回一个Promise实例。之后调用`handleResponse`中返回的`respond`函数。

### createContext

```js
createContext(req, res) {
  const context = Object.create(this.context);
  const request = context.request = Object.create(this.request);
  const response = context.response = Object.create(this.response);
  context.app = request.app = response.app = this;
  context.req = request.req = response.req = req;
  context.res = request.res = response.res = res;
  request.ctx = response.ctx = context;
  request.response = response;
  response.request = request;
  context.originalUrl = request.originalUrl = req.url;
  context.state = {};
  return context;
}
```

对于 `createContext` 函数, 它用于整合`req` `res` `request` `response`生成一个新的 `context` 对象作为参数传递给中间件。

```js
context = {
  request: { // 继承 koa request
    // ...
    app,
    req,
    res,
    ctx,
    response, 
  }, 
  response: { // 继承 koa response 
    // ...
    app,
    req,
    res,
    ctx,
    request, 
  },
  app, // 应用程序实例引用
  req, // node request
  res, // node response
  originalUrl, // url
  state, // state
}
```