# Promise对象

> 介绍Promise对象、用法

## 基本用法

es6规定， `Promise`对象是一个构造函数，用来生成`Promise`实例。

`Promise`构造函数接收一个函数作为参数，该函数的两个参数分别是`resolve`和`reject`。

`resolve`和`reject`是两个函数。`resolve`函数的作用是将`Promise`对象的状态从“进行中”变为“已成功”（即从 Pending 变为 Fulfilled），在异步操作成功时调用，并将异步操作的结果，作为参数传递出去。`reject`函数的作用是将`Promise`对象状态从“未完成”变为“已失败”（即从 Pending 变为 Rejected），在异步操作失败时调用，并将异步操作报出的错误，作为参数传递出去。

> 状态只能由 `Pending` 变为 `Fulfilled` 或由 `Pending` 变为 `Rejected` ，且状态改变之后不会在发生变化，会一直保持这个状态。

```js
const promise = new Promise((resolve, reject) => {
  // ... code

  if (true) {
    resolve(value); // 成功
  } else {
    reject(error); // 失败
  }
});
```

`Promise`实例生成以后，可以用`then`方法分别指定`resolved`状态和`rejected`状态的回调函数。

```js

promise.then((value) => {
  // 成功 接收value
}, (error) => { 
  // 失败 接收error
});

```

例子

```js
const promise = new Promise((resolve, reject) => {
  console.log(1);

  setTimeout(() => {
    resolve(2);
  }, 1000);
});

promise.then(value => {
  console.log(value);
});

console.log(3);

// 1
// 3
// 2 (延迟一秒)

```

## Promise.prototype.then()

`then`方法是定义在原型对象上，接收2个参数，第一参数是`resolve`的回调函数，第二个参数（可选）是`reject`的回调函数。

`then`方法返回的是一个新的`Promise`实例。因此可以采用链式写法。

```js

new Promise((resolve, reject) => {
  resolve(1)
}).then(value => {
  console.log(value);
  return 2;
}).then(value => {
  console.log(value);
  return 3;
}).then(value => {
  console.log(value);
});

// 1
// 2
// 3

```

上面的代码使用`then`方法，依次指定了两个回调函数。第一个回调函数完成以后，会将返回结果作为参数，传入第二个回调函数。

采用链式的`then`，可以指定一组按照次序调用的回调函数。这时，前一个回调函数，有可能返回的还是一个`Promise`对象（即有异步操作），这时后一个回调函数，就会等待该`Promise`对象的状态发生变化，才会被调用。


## Promise.prototype.catch()

`Promise.prototype.catch`方法是`.then(null, rejection)`的别名，用于指定发生错误时的回调函数。


```js

const promise = new Promise((resolve, reject) => {
  reject('error');

  //throw new Error('error');
});

promise.catch(err => {
  console.log(err); // error
});

```

当`Promise`对象的状态变为`Rejected`或者抛出一个错误，就会被`catch`方法指定的回调函数捕获。

如果 `Promise` 状态已经变成`Fulfilled`，再抛出错误是无效的。

## Promise.prototype.finally() 

`finally`方法用于指定不管 `Promise` 对象最后状态如何，都会执行的操作。该方法是 ES2018 引入标准的。

```js

promise.finally(() => {
  // 语句
});

// 等同于
promise.then(result => {
  // 语句
  return result;
}, error => {
  // 语句
  throw error;
});

```

`finally`方法的回调函数不接受任何参数，这意味着没有办法知道，前面的 `Promise` 状态到底是`Fulfilled`还是`Rejected`。这表明，`finally`方法里面的操作，应该是与状态无关的，不依赖于 `Promise` 的执行结果。

## Promise.all()

`Promise.all`方法用于将多个 `Promise` 实例，包装成一个新的 `Promise` 实例。

```js

const promise = Promise.all([
  promise1(),
  promise2(),
  promise3(),
]);

```

`Promise.all` 方法接收一个数组作为参数，每一项都是`Promise`实例

`promise`的状态由`promise1`、`promise2`、`promise3`决定，只有当`promise1`、`promise2`、`promise3`的状态都变成`Fulfilled`,此时`promise1`、`promise2`、`promise3`的返回值组成一个数组，传递给`promise`的回调函数（数组的顺序不是按promise的执行顺序）相反，其中有一个状态变成`Rejected`,`promise`的状态就变成`Rejected`，第一个被`Rejecte`的实例返回值会传递给`promise`的回调函数。

## Promise.race()

与`Promise.all`相似，接收一个数组作为参数，每一项都是`Promise`实例。

```js

const promise = Promise.race([
  promise1(),
  promise2(),
  promise3(),
]);

```
其中`promise1`、`promise2`、`promise3`有一个实例率先改变状态，`promise`的状态就跟着改变。
