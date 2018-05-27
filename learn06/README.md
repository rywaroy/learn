# Array

> javascript 高级程序设计 Array 类型总结, es6数组的扩展来自于 阮一峰 ECMAScript 6 入门

* [valueOf](#valueOf)
* [toString](#toString)
* [toLocaleString](#toLocaleString)
* [push](#push)
* [pop](#pop)
* [shift](#shift)
* [unshift](#unshift)
* [reverse](#reverse)
* [sort](#sort)
* [concat](#concat)
* [slice](#slice)
* [splice](#splice)
* [indexOf](#indexOf)
* [lastIndexOf](#lastIndexOf)
* [every](#every)
* [some](#some)
* [filter](#filter)
* [map](#map)
* [forEach](#forEach)
* [reduce](#reduce)
* [reduceRight](#reduceRight)
* [copyWithin](#copyWithin)
* [find](#find)
* [findIndex](#findIndex)
* [fill](#fill)
* [entries-keys-values](#entries-keys-values)
* [includes](#includes)

## 创建数组

创建数组的方式有两种

  1. 使用Array的构造函数

  ```js
  var colors1 = new Array()

  var colors2 = new Array(10)  // 如果事先知道数组的长度可以传一个数字，并且该数字会变成该数组length属性的值。

  var colors3 = new Array('red', 'blue') // 当然也可以向数组传入应该包含的项
  ```

  2. 创建数组的第二种基本方式是数组字面量表示法

  ```js
  var colors1 = []

  var colors2 = ['red', 'blue']
  ```

在读取或者设置数组的值时，要使用方括号并提供索引基于0的数字索引

```js
var colors = ['red', 'green', 'blue']

console.log(colors.length)  //3

colors[0] = 'yellow' // 修改array第一个元素为yellow

colors.length = 2 // 数组的length可读可写，通过设置length属性可以从数组的末尾移除项或者向数组中添加项
console.log(colors) // ['red', 'green']
console.log(colors[2]) // undefined  超出索引会得到undefined
```

特别注意数组最多可以包含4294967294个项，如果添加的项数超过这个数，可能会导致错误

## 检查数组

1. `instanceof`

```js
var arr = []
var str = ''

console.log(arr instanceof Array)  // true
console.log(str instanceof Array)  // false
```

2. `Object.prototype.toString`

```js
var arr = []

console.log(Object.prototype.toString.call(arr)) // [object Array]
```

3. `Array.isArray()`

```js
var arr = []

console.log(Array.isArray(arr))  // true
```

## 方法

* ### valueOf

  返回的是数组本身,即是相同的引用

  ```js
  var colors = ['red', 'blue', 'green']

  console.log(colors.valueOf())  // ["red", "blue", "green"]
  ```
* ### toString

  返回数组中每个值的字符串形式拼接形成的一个以逗号分隔的字符串

  ```js
  var colors = ['red', 'blue', 'green']

  console.log(colors.toString())  // red,blue,green
  ```

* ### toLocaleString

  与toString类似，不过是调用数组的每一项的toLocaleString方法

  ```js
  var colors = ['red', 'blue', 'green']

  console.log(colors.toLocaleString())  // red,blue,green
  ```

* ### push

  可以接收任意的参数，把它们逐个添加到数组的末尾，并返回修改后数组的长度

  ```js
  var colors = ['red', 'blue', 'green']
  var count = colors.push('yellow')

  console.log(colors) // ["red", "blue", "green", "yellow"]
  console.log(count) // 4
  ```

* ### pop

  删除数组最后一项，并返回移除的项

  ```js
  var colors = ['red', 'blue', 'green']
  var item = colors.pop()

  console.log(colors) // ["red", "blue"]
  console.log(item) // green
  ```

* ### shift

  删除数组的第一个项并返回该项

  ```js
  var colors = ['red', 'blue', 'green']
  var item = colors.shift()

  console.log(colors) // ["blue", "green"]
  console.log(item) // red
  ```

* ### unshift

  可以接收任意的参数，把它们逐个添加到数组的第一项，并返回修改后数组的长度

  ```js
  var colors = ['red', 'blue', 'green']
  var count = colors.unshift('yellow')

  console.log(colors) // ["yellow", "red", "blue", "green"]
  console.log(count) // 4
  ```

* ### reverse

  反转数组，会影响原数组,并且返回值为原数组的引用

  ```js
  var nums = [1,2,3,4,5]
  var newNums = nums.reverse()

  console.log(nums) // [5, 4, 3, 2, 1]
  console.log(newNums) // [5, 4, 3, 2, 1]
  console.log(nums === newNums) // true
  ```

* ### sort

  sort方法会调用每个数组项的toString方法，然后比较得到的字符串,即使是数字比较的也是字符串，以确定如何排序, 会改变原数组

  ```js
  var values = [0, 1, 5, 10, 15]

  values.sort() // [0, 1, 10, 15, 5]
  ```

  sort方法可以接收一个比较函数作为参数，以便指定那个值在前面。

  ```js
  function compare(val1, val2) {
    if (val1 < val2) {
      return -1
    } else if (val1 > val2) {
      return 1
    } else {
      return 0
    }
  }

  var values = [0, 1, 5, 10, 15]
  values.sort(compare)
  console.log(values)  // [0, 1, 5, 10, 15]
  ```

  对于数值类型或者其`valueOf()`方法会返回数值的对象类型，可以使用一个更简单的比较函数。这个函数只要用第二个值减第一个值即可。

  ```js
  var values = [1, -3, 0, 5, 10, 1, 34, 2]
  // 从小到大
  values.sort((a, b) => a - b)
  // 从大到小
  values.sort((a, b) => b - a)
  ```

  随机打乱数组

  ```js
  function randomsort(a, b) {
    return Math.random()>.5 ? -1 : 1;
    //用Math.random()函数生成0~1之间的随机数与0.5比较，返回-1或1
  }
  var arr = [1, 2, 3, 4, 5];
  arr.sort(randomsort);
  ```

* ### concat

  基于当前的数组中的所有项创建一个新的数组，具体来说就是先创建当前数组的一个副本，然后将接收到的参数添加到这个副本的末尾，最后返回新构建的数组。

  1. 如果没有传参数，只是简单地对当前数组的拷贝
  2. 如果传递的是一个或者多个数组，则该方法会将这些数组中的所有项都添加到该数组中
  3. 如果传递的不是数组，这些值就会简单地添加到数组的末尾

  ```js
  var colors = ['red']
  var colors2 = colors.concat('yellow', ['green']) // ["red", "yellow", "green"]
  ```

* ### slice

  slice() 方法返回一个从开始到结束（不包括结束）选择的数组的一部分`浅拷贝`到一个新数组对象。原始数组不会被修改

  1. 如果没有传参数则表示对当前数组的一个浅拷贝
  2. 如果传递了一个参数则返回从该参数指定的位置开始到当前数组末尾所有的项。
  3. 如果传递了两个参数则返回起始位置到结束位置的所有的项(不包含结束位置)

  如果有一个值为负值，则利用数组长度加上该值来确定相应的位置,比如下面的例子得到的结果是相同的

  ```js
  var colors = ['red', 'green', 'blue', 'yellow', 'purple']
  var colors2 = colors.slice(1)
  var colors3 = colors.slice(1, 4)
  var colors4 = colors.slice(-3, -1)

  console.log(colors) // ["red", "green", "blue", "yellow", "purple"]
  console.log(colors2) // ["green", "blue", "yellow", "purple"]
  console.log(colors3) // ["green", "blue", "yellow"]
  console.log(colors4) // ["blue", "yellow"]
  ```

* ### splice

  该方法可谓强大，可以实现`删除`、`插入`、`替换`等功能，且直接改变原数组的内容,通过以下例子来说明其用法

  ```js
  var colors = ['red', 'green', 'blue', 'yellow', 'purple']
  var removed = colors.splice(0, 1)

  console.log(colors) // ["green", "blue", "yellow", "purple"]
  console.log(removed) // ["red"]

  removed = colors.splice(1, 0, 'yellow', 'orange')
  console.log(colors) // ["green", "yellow", "orange", "blue", "yellow", "purple"]
  console.log(removed) // [] 如果没有删除，返回的是一个空数组

  removed = colors.splice(1, 1, 'red')
  console.log(colors) // ["green", "red", "orange", "blue", "yellow", "purple"]
  console.log(removed) // ["yellow"]
  ```

* ### indexOf

  接收2个参数：要查找的项和查找起点位置的索引(可选)，返回查找项在数组的位置，没有找到情况下会返回`-1`

  ```js
  var colors = ['red', 'green', 'blue', 'yellow', 'purple', 'green']

  console.log(colors.indexOf('green')) // 1
  console.log(colors.indexOf('green', 3)) // 5
  console.log(colors.indexOf('abc')) // -1
  ```

* ### lastIndexOf

  同`indexOf`,从数组的末尾开始查找

  ```js
  var colors = ['red', 'green', 'blue', 'yellow', 'purple', 'green']

  console.log(colors.lastIndexOf('green')) // 5
  ```

* ### every

  对数组的每一项运行给定的函数，如果该函数每一项都返回true，则返回true

  ```js
  var numbers = [1, 2, 3, 4, 5, 4, 3, 2, 1]

  var everyResult1 = numbers.every(function(item, index, array) {
    return item > 2
  })

  console.log(everyResult1) // false

  var everyResult2 = numbers.every(function(item, index, array) {
    return item > 0
  })

  console.log(everyResult2) // true
  ```

* ### some

  对数组的每一项运行给定的函数，如果该函数任一项都返回true，则返回true

  ```js
  var numbers = [1, 2, 3, 4, 5, 4, 3, 2, 1]

  var someResult1 = numbers.some(function(item, index, array) {
    return item > 2
  })

  console.log(someResult1) // true

  var someResult2 = numbers.some(function(item, index, array) {
    return item > 10
  })

  console.log(someResult2) // false
  ```

* ### filter

  对数组的每一项运行给定的函数，返回该函数会返回true的项组成的数组

  ```js
  var numbers = [1, 2, 3, 4, 5, 4, 3, 2, 1]

  var filterResult = numbers.filter(function(item, index, array) {
    return item > 2
  })

  console.log(filterResult) // [3, 4, 5, 4, 3]

  ```

* ### map

  对数组的每一项运行给定的函数，返回每次函数调用的结果组成的数组

  ```js
  var numbers = [1, 2, 3, 4, 5, 4, 3, 2, 1]

  var mapResult = numbers.map(function(item, index, array){
    return item * 2
  })

  console.log(mapResult) // [2, 4, 6, 8, 10, 8, 6, 4, 2]
  ```

* ### forEach

  对数组的每一项运行给定的函数。这个方法没有返回值

  ```js
  var numbers = [1, 2, 3]

  numbers.forEach(function(item, index, array){
    console.log(item)
  })

  // 1
  // 2
  // 3
  ```

* ### reduce

  迭代数组中所有项，返回一个最终值

  reduce方法接收2个参数，一个在每一项上调用的函数和作为缩小基础的初始值(可选)。传给的函数接收4个参数：前一个值、当前值、项的索引和数组对象。这个函数返回任何值都会作为第一个参数自动传给下一项。第一次迭代发生在数组的第二项上，因此第一个参数是数组的第一项，第二个参数就是数组的第二项。

  ```js
  var values = [1, 2, 3, 4, 5]
  var sum = values.reduce(function(prev, cur, index, array){
    return prev + cur;
  })
  
  console.log(sum) // 15
  ```

* ### reduceRight

  同`reduce`,从数组最后一项开始，向前遍历到第一项

* ### copyWithin

  `es6`

  数组实例的copyWithin方法，在当前数组内部，将指定位置的成员复制到其他位置（会覆盖原有成员），然后返回当前数组。也就是说，使用这个方法，会修改当前数组。

  接收3个参数
  
  1. target（必需）：从该位置开始替换数据。如果为负值，表示倒数。
  2. start（可选）：从该位置开始读取数据，默认为 0。如果为负值，表示倒数。
  3. end（可选）：到该位置前停止读取数据，默认等于数组长度。如果为负值，表示倒数。

  ```js
  // 将3号位复制到0号位
  [1, 2, 3, 4, 5].copyWithin(0, 3, 4)
  // [4, 2, 3, 4, 5]

  // -2相当于3号位，-1相当于4号位
  [1, 2, 3, 4, 5].copyWithin(0, -2, -1)
  // [4, 2, 3, 4, 5]

  // 将3号位复制到0号位
  [].copyWithin.call({length: 5, 3: 1}, 0, 3)
  // {0: 1, 3: 1, length: 5}

  // 将2号位到数组结束，复制到0号位
  let i32a = new Int32Array([1, 2, 3, 4, 5]);
  i32a.copyWithin(0, 2);
  // Int32Array [3, 4, 5, 4, 5]

  // 对于没有部署 TypedArray 的 copyWithin 方法的平台
  // 需要采用下面的写法
  [].copyWithin.call(new Int32Array([1, 2, 3, 4, 5]), 0, 3, 4);
  // Int32Array [4, 2, 3, 4, 5]
  ```

* ### find

  `es6`

  数组实例的`find`方法，用于找出第一个符合条件的数组成员。它的参数是一个回调函数，所有数组成员依次执行该回调函数，直到找出第一个返回值为true的成员，然后返回该成员。如果没有符合条件的成员，则返回`undefined`。

  ```js
  [1, 4, -5, 10].find((n) => n < 0)  //找出第一个小于0的成员
  // -5
  ```

  `find`方法的回调函数可以接受三个参数，依次为当前的值、当前的位置和原数组

  ```js
  [1, 5, 10, 15].find(function(value, index, arr) {
    return value > 9;
  }) // 10
  ```

  `find`方法可以接收第二个参数，用来绑定回调函数的`this`对象

  ```js
  function f(v){
    return v > this.age;
  }
  let person = {name: 'John', age: 20};
  [10, 12, 26, 15].find(f, person);    // 26
  ```

* ### findIndex

  `es6`

  同`find`，返回第一个符合条件的数组成员的索引。

* ### fill

  `es6`

  `fill`方法使用给定值，填充一个数组。

  ```js
  ['a', 'b', 'c'].fill(7)
  // [7, 7, 7]

  new Array(3).fill(7)
  // [7, 7, 7]
  ```

  `fill`方法还可以接受第二个和第三个参数，用于指定填充的起始位置和结束位置。

  ```js
  ['a', 'b', 'c'].fill(7, 1, 2)
  // ['a', 7, 'c']
  ```

* ### entries-keys-values

  ES6 提供三个新的方法——`entries()`，`keys()`和`values()`——用于遍历数组。它们都返回一个遍历器对象，可以用`for...of`循环进行遍历，唯一的区别是`keys()`是对键名的遍历、`values()`是对键值的遍历，`entries()`是对键值对的遍历。

  ```js
  for (let index of ['a', 'b'].keys()) {
    console.log(index);
  }
  // 0
  // 1

  for (let elem of ['a', 'b'].values()) {
    console.log(elem);
  }
  // 'a'
  // 'b'

  for (let [index, elem] of ['a', 'b'].entries()) {
    console.log(index, elem);
  }
  // 0 "a"
  // 1 "b"
  ```

* ### includes

  `Array.prototype.includes`方法返回一个布尔值，表示某个数组是否包含给定的值，与字符串的`includes`方法类似。ES2016 引入了该方法。

  ```js
  [1, 2, 3].includes(2)     // true
  [1, 2, 3].includes(4)     // false
  [1, 2, NaN].includes(NaN) // true
  ```

  该方法的第二个参数表示搜索的起始位置，默认为`0`。如果第二个参数为负数，则表示倒数的位置，如果这时它大于数组长度（比如第二个参数为`-4`，但数组长度为`3`），则会重置为从`0`开始。

  ```js
  [1, 2, 3].includes(3, 3);  // false
  [1, 2, 3].includes(3, -1); // true
  ```