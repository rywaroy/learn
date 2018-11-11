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
let keys = [];
const re = pathToRegexp('/article/:id', keys);
console.log(re);  // /^\/article\/((?:[^\/]+?))(?:\/(?=$))?$/i
console.log(keys);
// [ { name: 'id',
// prefix: '/',
// delimiter: '/',
// optional: false,
// repeat: false,
// partial: false,
// asterisk: false,
// pattern: '[^\\/]+?' } ]
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

打印结果

```js
[ '/article',
  { name: 'id',
    prefix: '/',
    delimiter: '/',
    optional: false,
    repeat: false,
    partial: false,
    asterisk: false,
    pattern: '[^\\/]+?' } ]
```

4. compile

快速填充 url 字符串的参数值

```js
const pathToRegexp = require('path-to-regexp');

const url = '/article/:id/:name';
const data = {
  id: 2,
  name: 'hello'
}

console.log(pathToRegexp.compile(url)(data)); // /article/2/hello
```

### Layer match

```js
Layer.prototype.match = function (path) {
  return this.regexp.test(path);
};
```

验证路由是否能匹配成功

```js
const layer = new Layer('/article/:id', ['get'], []);

console.log(layer.match('/article/123')); // true
```

### Layer captures

```js
Layer.prototype.captures = function (path) {
  if (this.opts.ignoreCaptures) return [];
  return path.match(this.regexp).slice(1);
};
```

捕获正则匹配结果, 如果设置了`ignoreCaptures`为`true`，则忽略返回空数组

```js
const layer = new Layer('/article/:id/:name', ['get'], []);

console.log(layer.captures('/article/123/zhang')); // [ '123', 'zhang' ]
```

### Layer params

```js
Layer.prototype.params = function (path, captures, existingParams) {
  var params = existingParams || {};

  for (var len = captures.length, i=0; i<len; i++) {
    if (this.paramNames[i]) {
      var c = captures[i];
      params[this.paramNames[i].name] = c ? safeDecodeURIComponent(c) : c;
    }
  }

  return params;
};
```

```js
const layer = new Layer('/article/:id/:name', ['get'], []);

const params = {};
layer.params('/article/123/zhang', ['123', 'zhang'], params);
console.log(params) // { id: '123', name: 'zhang' }
```

`koa-router`用此方法将params挂载在`ctx.params`上，因此可以通过`ctx.params.id` 和 `ctx.params.name` 来获取对应匹配到的id 和 name。

### Layer param

在Layer的`param`方法之前，先来看看Router的`param`

```js
Router.prototype.register = function (path, methods, middleware, opts) {
  //...
  Object.keys(this.params).forEach(function (param) {
    route.param(param, this.params[param]);
  }, this);
  // ...
}

Router.prototype.param = function (param, middleware) {
  this.params[param] = middleware;
  this.stack.forEach(function (route) {
    route.param(param, middleware);
  });
  return this;
};
```

可以发现，无论是当路由注册时，还是调用Router的`param`，都会使得Router的路由栈`stack`中的每个Layer实例`route`调用他自身的`param`方法。

再来看一个例子

```js
function m1 (ctx, next) {
  ctx.body = ctx.name
}

function m2 (param, ctx, next) {
  console.log(1)
  ctx.name = 'zzh'
  next()
}

function m3 (param, ctx, next) {
  console.log(2)
  next()
}

router.register('/article/:id/:name', ['GET'], m1);

router.param('id', m2)

router.param('name', m3)

// 1
// 2
// zzh
```

Router的`param`可以做一些参数校验的操作，从中间件执行顺序看，先是`m2` `m3` 最后执行路由的中间件 `m1`。

```js
Layer.prototype.param = function (param, fn) {
  var stack = this.stack;
  var params = this.paramNames;
  var middleware = function (ctx, next) {
    return fn.call(this, ctx.params[param], ctx, next);
  };
  middleware.param = param; // 给中间添加param属性

  var names = params.map(function (p) { // 获取prams.name集成的数组 [id, name]
    return p.name;
  });

  var x = names.indexOf(param); // 判断传入的param在names的位置
  if (x > -1) {
    stack.some(function (fn, i) {
       // 判断中间件函数是否存在param,不存在则是路由中间件
       // 如果存在param，则根据param在names的顺序决定。 如例子中的 m2.id 会优先 m3.name
      if (!fn.param || names.indexOf(fn.param) > x) {
        stack.splice(i, 0, middleware); // 插入栈, 最终结果[m2, m3, m1]
        return true;
      }
    });
  }

  return this;
};
```

`param`方法会将传入的中间件`fn`依照layer的`paramNames`中的顺序，放入`stack`中间栈中，保证一些有依赖关系的中间件会按序执行。

###  Layer setPrefix

```js
Router.prototype.prefix = function (prefix) {
  prefix = prefix.replace(/\/$/, '');

  this.opts.prefix = prefix;

  this.stack.forEach(function (route) {
    route.setPrefix(prefix);
  });

  return this;
};
```

Router的`prefix`会遍历路由栈`stack`，每个Layer实例都会执行`setPrefix`方法并传入路由前缀`prefix`。

```js
Layer.prototype.setPrefix = function (prefix) {
  if (this.path) {
    this.path = prefix + this.path;
    this.paramNames = [];
    this.regexp = pathToRegExp(this.path, this.paramNames, this.opts);
  }

  return this;
};
```

而在Layer的`setPrefix`中，会把接收的路由前缀`prefix`拼接在路径前面并且生成新的路由正则。由于前缀是拼接的，多次调用`setPrefix`会是前缀累加，并不会覆盖。

## url

```js
Router.prototype.url = function (name, params) {
  var route = this.route(name);

  if (route) {
    var args = Array.prototype.slice.call(arguments, 1);
    return route.url.apply(route, args);
  }

  return new Error("No route found for name: " + name);
};
```

Router的`url`可以生成对应的`path`，官网文档的例子：

```js
router.get('user', '/users/:id', (ctx, next) => {
  // ...
});

router.url('user', 3);
// => "/users/3"

router.url('user', { id: 3 });
// => "/users/3"

router.use((ctx, next) => {
  // redirect to named route
  ctx.redirect(ctx.router.url('sign-in'));
})

router.url('user', { id: 3 }, { query: { limit: 1 } });
// => "/users/3?limit=1"

router.url('user', { id: 3 }, { query: "limit=1" });
// => "/users/3?limit=1"
```

实际上`Router.url`先是调用`Router.route`找到路由栈中对应的`route`,再调用`route.url`方法，传入除了`name`以外的参数。

```js
router.get('article', '/article/:id/:name', (ctx, next) => {
  // ...
});

console.log(router.url('article', 3, 'zzh')) // /article/3/zzh
console.log(router.url('article', { name: 'zzh', id: 3})) // /article/3/zzh
console.log(router.url('article', [3, 'zzh'])) // /article/3/zzh
console.log(router.url('article', 3, 'zzh', {query: {limit: 10}})) // /article/3/zzh?limit=10
```

以上的调用方式都是有效的，来看看`Layer.url`是如何处理的。

```js
Layer.prototype.url = function (params, options) {
  var args = params;
  var url = this.path.replace(/\(\.\*\)/g, '');
  var toPath = pathToRegExp.compile(url);
  var replaced;

  // 针对layer.url(参数, 参数, 参数, opts)的情况
  if (typeof params != 'object') {
    args = Array.prototype.slice.call(arguments); // 获取所有参数（包括opts）
    if (typeof args[args.length - 1] == 'object') { // 检查最后一项是否为opts
      options = args[args.length - 1]; // opts赋值
      args = args.slice(0, args.length - 1); // 去除opts，组合成[参数,参数,参数]
    }
  }

  var tokens = pathToRegExp.parse(url); // 解析url
  var replace = {};

  // 针对layer.url(参数, 参数, 参数, opts) 和 layer.url([参数,参数,参数], opts)的情况
  if (args instanceof Array) {
    for (var len = tokens.length, i=0, j=0; i<len; i++) {
      if (tokens[i].name) replace[tokens[i].name] = args[j++]; // 将匹配到 例子中的{ id: 3, name: 'zzh' }
    }
  } else if (tokens.some(token => token.name)) { // 存在动态路由的情况 /xx/:xx
    replace = params;
  } else { // 不存在动态路由的情况 /xx/xx, layer.url(opts)
    options = params;
  }

  replaced = toPath(replace); // 填充字符串

  if (options && options.query) { // 如果存在opts 如{query: {limit: 10}}
    var replaced = new uri(replaced)
    replaced.search(options.query); // 创建url,拼接query
    return replaced.toString();
  }

  return replaced;
};
```

## match

传入路由与请求方法，对路由做匹配，返回匹配成功的路由对象

```js
Router.prototype.match = function (path, method) {
  var layers = this.stack;
  var layer;
  var matched = {
    path: [],
    pathAndMethod: [],
    route: false
  };

  for (var len = layers.length, i = 0; i < len; i++) {
    layer = layers[i];

    debug('test %s %s', layer.path, layer.regexp);

    if (layer.match(path)) { // 匹配路由
      matched.path.push(layer);

      if (layer.methods.length === 0 || ~layer.methods.indexOf(method)) { // 路由没有methods或者methods中存在method
        matched.pathAndMethod.push(layer);
        /*
        如果存在methods，则将route设为true
        在Router.routes 方法中会对matched.route做验证
        if (!matched.route) return next()
        如果为false则会直接跳过
        */
        if (layer.methods.length) matched.route = true;
      }
    }
  }

  return matched;
};
```

## all

如果一个路由可以支持多种请求方法,可以使用`Router.all`来简化操作

```js
router.all('/article', ctx  => { ctx.body = 'article' });

// GET localhost:8080/article => article
// POST localhost:8080/article => article
```

```js
Router.prototype.all = function (name, path, middleware) {
  var middleware;

  if (typeof path === 'string') {
    middleware = Array.prototype.slice.call(arguments, 2);
  } else {
    middleware = Array.prototype.slice.call(arguments, 1);
    path = name;
    name = null;
  }

  this.register(path, methods, middleware, {
    name: name
  });

  return this;
};
```

其实现方法也比较简单，路由注册时传入了所以的请求方法`methods`。

## redirect

重定向

```js
Router.prototype.redirect = function (source, destination, code) {
  // lookup source route by name
  if (source[0] !== '/') {
    source = this.url(source);
  }

  // lookup destination route by name
  if (destination[0] !== '/') {
    destination = this.url(destination);
  }

  return this.all(source, ctx => {
    ctx.redirect(destination);
    ctx.status = code || 301;
  });
};
```

`redirect`接收3个参数，分别是来源、目的和http状态码。对`source`和`destination`进行第一个字符串判断，是否是`/`来区分是路径还是路由名称。如果是是路由名称，则用`Router.url`来获取路径。注册`source`,匹配到路由时，通过`ctx.redirect`重定向到`destination`。

## use

`Router.use`可以用来注册中间件。

例子：

```js
var forums = new Router();
var posts = new Router();

posts.get('/', (ctx, next) => {...});
posts.get('/:pid', (ctx, next) => {...});
forums.use('/forums/:fid/posts', posts.routes(), posts.allowedMethods());

// responds to "/forums/123/posts" and "/forums/123/posts/123"
app.use(forums.routes());
```

 ```js
 // session middleware will run before authorize
 router
   .use(session())
   .use(authorize());

 // use middleware only with given path
 router.use('/users', userAuth());

 // or with an array of paths
 router.use(['/users', '/admin'], userAuth());

 app.use(router.routes());
```

中间件可以分2种

1. 普通中间件函数
2. `Router`实例

如果传入的中间件是`Router`实例，那么`router`会整合所有中间件上的路由栈`stack`。如果有`path`参数，则会被作为路由前缀使用。

```js
Router.prototype.use = function () {
  var router = this;
  var middleware = Array.prototype.slice.call(arguments);
  var path;

  // 判断第一个参数是否是一个路由数组
  if (Array.isArray(middleware[0]) && typeof middleware[0][0] === 'string') {
    middleware[0].forEach(function (p) {
      router.use.apply(router, [p].concat(middleware.slice(1)));
    });

    return this;
  }

  // 判断是否有path参数
  var hasPath = typeof middleware[0] === 'string';
  if (hasPath) {
    path = middleware.shift();
  }

  
  // 遍历中间件
  middleware.forEach(function (m) {
    /*
    判断是否是Router
    Router.routes 会给返回的dispatch函数加上 `dispatch.router = this`
    */
    if (m.router) {
      // 遍历每个实例中的路由栈
      m.router.stack.forEach(function (nestedLayer) {
        // 如果有path参数，则设置为前缀
        if (path) nestedLayer.setPrefix(path);

        // router的配置项设置了前缀
        if (router.opts.prefix) nestedLayer.setPrefix(router.opts.prefix);

        // 将实例中的路由加入router的路由栈
        router.stack.push(nestedLayer);
      });

      if (router.params) { // 验证params
        Object.keys(router.params).forEach(function (key) {
          m.router.param(key, router.params[key]);
        });
      }
    } else { // 如果是普通中间件，则注册一个path为(.*)的路由
      router.register(path || '(.*)', [], m, { end: false, ignoreCaptures: !hasPath });
    }
  });

  return this;
};
```

## routes

```js
Router.prototype.routes = Router.prototype.middleware = function () {
  var router = this;

  var dispatch = function dispatch(ctx, next) {
    // ...
  }

  dispatch.router = this;

  return dispatch;
}
```

从源码中可以看到，`routes`还有一个别名`middleware`可以实现相同的功能。

当路由注册完后，可以调用`router.routes`来讲路由添加到koa的中间件处理机制中。由于koa的中间是以一个函数形式存在的，所以`routes`也是返回了一个`dispatch`函数。同时`dispatch`还添加了一个`router`属性，在`Router.use`中，可以根据`router`来判断是否是一个Router实例还是普通中间件。

```js
function dispatch(ctx, next) {
  debug('%s %s', ctx.method, ctx.path);

  // 获取请求的路径
  var path = router.opts.routerPath || ctx.routerPath || ctx.path;

  // 匹配对应的 Layer 实例对象
  var matched = router.match(path, ctx.method);
  var layerChain, layer, i;

  if (ctx.matched) {
    ctx.matched.push.apply(ctx.matched, matched.path);
  } else {
    ctx.matched = matched.path;
  }

  ctx.router = router;

  // 如果没有匹配对应的路由，则直接跳过
  if (!matched.route) return next();

  // 获取匹配成功的Layer实例对象
  var matchedLayers = matched.pathAndMethod
  var mostSpecificLayer = matchedLayers[matchedLayers.length - 1]
  ctx._matchedRoute = mostSpecificLayer.path; // ctx._matchedRoute赋值匹配的路由path
  if (mostSpecificLayer.name) { // ctx._matchedRouteName赋值匹配的路由name
    ctx._matchedRouteName = mostSpecificLayer.name;
  }

  // 遍历匹配成功的Layer实例对象， 整合layer的中间件stack
  layerChain = matchedLayers.reduce(function(memo, layer) {

    // 先添加一个中间件，来为ctx添加一些路由的属性
    memo.push(function(ctx, next) {
      // layer.captures 获取存储路由中参数的值的数组 [id, name]
      ctx.captures = layer.captures(path, ctx.captures);

      // layer.params 获取路由参数对象 {id: 3, name: 'zzh'}
      ctx.params = layer.params(path, ctx.captures, ctx.params);
      ctx.routerName = layer.name;
      return next();
    });
    return memo.concat(layer.stack); // 合并中间
  }, []);

  return compose(layerChain)(ctx, next); // koa-compose 来处理中间件
};
```

可以发现在获取请求路径path时，会先从`router.opts.routerPath`, 所以前面设置了`routerPath`任何请求都会转发到`routerPath`的路由上。其次会从`ctx.routerPath`上获取，我们可以在中间件中修改`ctx.routerPath`从而实现路由的转发。

## allowedMethods

`allowedMethods`负责提供一个后置的METHOD检查中间件, 据当前请求的`method`进行的一些校验，并返回一些错误信息。

```js
Router.prototype.allowedMethods = function (options) {
  options = options || {};
  var implemented = this.methods; // 获取默认支持的http方法 默认HEAD OPTIONS GET PUT PATCH POST DELETE

  // 作为koa的中间，同样返回一个function
  return function allowedMethods(ctx, next) {
    return next().then(function() {
      var allowed = {};

      if (!ctx.status || ctx.status === 404) { // 没有返回http状态码或404
        
        // 遍历匹配的路由，找出允许的method
        ctx.matched.forEach(function (route) {
          route.methods.forEach(function (method) {
            allowed[method] = method;
          });
        });

        var allowedArr = Object.keys(allowed);

        if (!~implemented.indexOf(ctx.method)) { // http方法不支持
          if (options.throw) { // 如果设置了throw
            var notImplementedThrowable;

            // 如果设置了notImplemented则执行notImplemented，否则抛出 HTTP Error
            if (typeof options.notImplemented === 'function') {
              notImplementedThrowable = options.notImplemented(); // set whatever the user returns from their function
            } else {
              notImplementedThrowable = new HttpError.NotImplemented();
            }
            throw notImplementedThrowable;
          } else { // 没有设置throw则返回501 Not implemented， 设置头Allow,
            ctx.status = 501;
            ctx.set('Allow', allowedArr.join(', '));
          }
        } else if (allowedArr.length) { // 存在允许的请求方法
          if (ctx.method === 'OPTIONS') { // 如果是OPTIONS预请求，则返回200
            ctx.status = 200;
            ctx.body = '';
            ctx.set('Allow', allowedArr.join(', '));
          } else if (!allowed[ctx.method]) { // 没有对应的method, 比如注册的是get,但是用post请求
            if (options.throw) {
              var notAllowedThrowable;
              // 如果设置了methodNotAllowed则执行methodNotAllowed，否则抛出 HTTP Error
              if (typeof options.methodNotAllowed === 'function') {
                notAllowedThrowable = options.methodNotAllowed(); // set whatever the user returns from their function
              } else {
                notAllowedThrowable = new HttpError.MethodNotAllowed();
              }
              throw notAllowedThrowable;
            } else { // 没有设置throw则返回405 Method not allowed， 设置头Allow,
              ctx.status = 405;
              ctx.set('Allow', allowedArr.join(', '));
            }
          }
        }
      }
    });
  };
};
```