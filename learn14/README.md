# js函数节流防抖以及lodash节流防抖的实现

## 函数防抖

先说下函数的防抖`debounce`。假如有这样一个需求，用户可以在输入框输入关键字时能够实时地去联想或者搜索内容。这实现起来比较简单，只要监听输入框的`keyup`或`input`事件，获取输入框的内容，做出对应的操作，调用处理函数就行了。但是这样有一个弊端，用户在持续输入关键字的同时事件处理函数也在无限制地被调用，调用的频率没有被限制，浏览器的负担也被加重。残缺的关键字更是没有搜索价值，影响了用户体验。

函数的防抖就是在持续调用函数时，保证在一段时间内函数不会被触发。如果在这段时间内，函数再次被调用，那么会更新时间并延时触发函数。

```js
function debounce(func, time) {
  let timer;
  return function() {
    if(timer) {
      clearTimeout(timer);
    }
    const args = arguments;
    timer = setTimeout(() => {
      func.apply(this, args);
    }, time);
  }
}
document.getElementById('input').addEventListener('input', debounce((e) => {
  console.log(e.target.value);
}, 500));
```

`debounce`的关键在于在定时器`timer`的更新，除非第一次调用，之后的每次调用都会清空和重置定时器。这样保证了持续调用都不会触发`func`,只有在`time`时间过后,`setTimeout`生效才会触发`func`。


## 函数节流

节流`throttle`与防抖相似，只是运用的场景不同。节流是指在持续调用时，保证一定时间内只触发一次事件处理函数。与防抖不同的是，函数节流会用在比`keyup`或`input`更加频繁触发的事件中，比如`scroll` `resize` 各类`mouse`事件。例如在实现悬浮导航，根据滚动距离来进行高亮处理，监听`scroll`事件也会无节制的触发事件处理函数。如果对滚动精度要求没那么高的话，可以使用节流要减少事件处理函数的触发频率。

```js
function throttle(func, time) {
  let start = Date.now();
  return function() {
    const now = Date.now();
    if (now - start >= time) {
      func.apply(this, arguments);
      start = Date.now();
    }
  }
}
window.addEventListener('scroll', throttle(function(){
  console.log(document.documentElement.scrollTop || document.body.scrollTop);
}, 500));
```

`throttle`关键在于对一个时间差的判断。每当调用时会获取当前时间，再于上次`func`触发时间做对比，如果时间差超过了`time`,那么会触发`func`，并重置`start`。

`throttle`的实现有多种，我们还可以添加定时器来实现最后一次触发事件还会执行一次事件处理函数。

```js
function throttle(func, time) {
  let start = Date.now();
  let timer;
  return function() {
    const now = Date.now();
    const args = arguments;
    if (timer) {
      clearTimeout(timer);
    }
    if (now - start >= time) {
      func.apply(this, arguments);
      start = Date.now();
    } else {
      timer = setTimeout(() => {
        func.apply(this, args)
      }, time);
    }
  }
}
```

非常明显的，这种`throttle`函数是与上面的`debounce`函数的结合，对时间差判断同时维护着`timer`,最后满足条件`setTimeout`生效触发一次`func`。