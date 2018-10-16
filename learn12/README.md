# koa 中间件机制

> 略读了koa源码，介绍下koa巧妙的中间件机制

先放一段源码

```js
const isGeneratorFunction = require('is-generator-function');
const compose = require('koa-compose');
const convert = require('koa-convert');

module.exports = class Application extends Emitter {

  // ...

  use(fn) {
    if (typeof fn !== 'function') throw new TypeError('middleware must be a function!');
    if (isGeneratorFunction(fn)) {
      deprecate('Support for generators will be removed in v3. ' +
                'See the documentation for examples of how to convert old middleware ' +
                'https://github.com/koajs/koa/blob/master/docs/migration.md');
      fn = convert(fn);
    }
    debug('use %s', fn._name || fn.name || '-');
    this.middleware.push(fn);
    return this;
  }

  callback() {
    const fn = compose(this.middleware);

    if (!this.listenerCount('error')) this.on('error', this.onerror);

    const handleRequest = (req, res) => {
      const ctx = this.createContext(req, res);
      return this.handleRequest(ctx, fn);
    };

    return handleRequest;
  }
}
```

首先是 `app.use(function)` 方法， 将给定的中间件方法添加到koa应用程序。

`use` 方法接收一个 function (中间件)， 由 `typeof` 来判断中间件类型，若不是 function类型，则抛出错误。

然后 由 `isGeneratorFunction`判断是否为 generator函数， 在 koa1中使用的是generator函数，koa2中使用的是 async/await，利用 `koa-convert` 模块进行转换，兼容generator。 最后将中间件收集在 `middleware`中。

`app.callback()` 用于 `http.createServer()` 方法的回调函数来处理请求

在 `callback` 方法中， 使用 `koa-compose` 来处理了 `this.middleware` 并返回一个 function， 看看 compose 做了什么。


koa-compose 源码

```js

module.exports = compose

/**
 * Compose `middleware` returning
 * a fully valid middleware comprised
 * of all those which are passed.
 *
 * @param {Array} middleware
 * @return {Function}
 * @api public
 */

function compose (middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }

  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */

  return function (context, next) {
    // last called middleware #
    let index = -1
    return dispatch(0)
    function dispatch (i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}

```

`compose` 方法接收一个中间件数组，开始验证了 `middleware`的数组类型，以及遍历`middleware`验证 `fn`是 函数类型。然后返回一个 接收 `context` 和 `next` 的匿名函数。

简化下匿名函数

```js
function (context, next) {
  // last called middleware #
  let index = -1
  return dispatch(0)
  function dispatch (i) {
    // ...
    let fn = middleware[i]
    return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
  }
}
```

*可见该函数最后返回一个用递归构造，中间件函数相互嵌套的Promise函数*

逐句解析下 `dispatch` 干了什么

```js
function dispatch (i) {
  if (i <= index) return Promise.reject(new Error('next() called multiple times'))
  index = i
  // ...
}
```

外部定义了一个标识符`index`,每次调用`dispatch`传入`i`, `i`是递增的，将`i`赋值给`index`保证`index`递增，`dispatch`内部判断 `i` `index`大小，当 `i` 小于等于 `index` 时抛出错误。 这样做防止类似调用了`dispatch(3)`再调用`dispatch(1)`

例子

```js
const fn = compose([
  async function(ctx, next) {
    console.log(1);
    await next(); // 第一步 i = 0 index = 0
    await next(); // 第三步 i = 0 index = 1 此时 i 小于等于 index, 抛出错误 next 不能多次调用
  },
  async function(ctx, next) {
    console.log(2);
    await next(); // 第二步 i = 1 index = 1
  },
]);
```

```js
function dispatch (i) {
  // ...

  let fn = middleware[i]
  if (i === middleware.length) fn = next
  if (!fn) return Promise.resolve()

  // ...
}
```

获取对应的中间件函数，如果中间件函数已经执行完了(`i === middleware.length` 情况), 则调用外部传入的`next`方法。若没有`next`或者中间件函数全部执行，则终止递归，返回`Promise.resolve()`


```js
function dispatch (i) {
  // ...

  try {
    return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
  } catch (err) {
    return Promise.reject(err)
  }
}
```

最后一步，用`Promise.resolve`将中间件函数fn转为`Promise`对象, `context`作为第一个参数传递下去，执行下一个中间件函数`dispatch(i+1)`作为第二个参数。`try catch`来捕获错误。

这就是为什么在中间件中调用`await next()`会执行下一个中间件。

测试：

```js
const fn = compose([
  async function a(ctx, next) {
    ctx.a = 'a';
    console.log(1);
    await next();
    console.log(7);
  },
  async function b(ctx, next) {
    ctx.b = 'b';
    console.log(2);
    await next();
    console.log(6);
  },
  async function c(ctx, next) {
    ctx.c = 'c';
    console.log(3);
    await next();
    console.log(5);
  },
]);
const ctx = {};
fn(ctx, async () => {
  console.log(4);
}).then(() => {
  console.log(8);
  console.log(ctx);
});

// 输出： 1 2 3 4 5 6 7 8 { a: 'a', b: 'b', c: 'c' }

```

以上代码进过`compose`处理，等效于

```js

const fn = function(ctx, next) {
  return Promise.resolve(async function a (ctx) {
    ctx.a = 'a';
    console.log(1);
    await Promise.resolve(async function b (ctx) {
      ctx.b = 'b';
      console.log(2);
      await Promise.resolve(async function c (ctx) {
        ctx.b = 'c';
        console.log(3);
        await next();
        console.log(5);
      }(ctx));
      console.log(6)
    }(ctx));
    console.log(7);
  }(ctx));
}

const ctx = {};

fn(ctx, async () => {
  console.log(4);
}).then(() => {
  console.log(8);
  console.log(ctx);
});

```