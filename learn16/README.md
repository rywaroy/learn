# js的继承

> 总结下Javascript高级程序设计对象继承,es6继承

## 原型链继承

```js
// 父类

function Parent(name) {
  this.name = name;
  this.age = 30;
}

Parent.prototype.say = function() {
  console.log(`parent name is ${this.name}`);
}
```

```js
function Child(name) {
  this.name = name;
}

Child.prototype = new Parent('father');
Child.prototype.constructor = Child;

const child = new Child('son');
child.say(); // parent name: son
console.log(child.age); // 30
console.log(child.name); // son
```

原型链继承的基本思想是利用原型让一个引用类型继承另一个引用类型的属性和方法。上述代码中`Child`继承了`Parent`，通过创建一个`Parent`的实例并赋值给`Child.prototype`实现的。实现的本质是重写原型对象，代之一个新类型的实例。`Parent`的实例中的所有属性和方法同时在存在于`Child.prototype`中了。

当以读取模式访问一个实例属性时，首先会在实例中搜索该属性，如果没有找到该属性，则会继续搜索实例的原型。所以实例`child`调用`say`方法时，会先搜索实例，再搜索`Child.prototype`，接着搜索`Parent.prototype`,最后一步才会找到改方法。

同样的，在`say`方法中的`this.name`，会先搜索到`Child.prototype`上的`name`。于是打印出了parent name: son。

当然原型链继承也存在一些问题，原型属性上的引用类型的值会被所有实例共享。

```js
function Parent() {
  this.hobby = ['sing', 'swim', 'run'];
}

function Child() {}

Child.prototype = new Parent();

const child1 = new Child();
child1.hobby.push('coding');
console.log(child1.hobby); // [ 'sing', 'swim', 'run', 'coding' ]

const child2 = new Child();
child2.hobby.push('dance');
console.log(child2.hobby) // [ 'sing', 'swim', 'run', 'coding', 'dance' ]
```

另一个问题，在创建子类的实例时，不能想超类型的构造函数中传递参数。


## 构造函数

```js
function Parent() {
  this.hobby = ['sing', 'swim', 'run'];
}

function Child() {
  Parent.call(this);
}

const child1 = new Child();
child1.hobby.push('coding');
console.log(child1.hobby); // [ 'sing', 'swim', 'run', 'coding' ]

const child2 = new Child();
child2.hobby.push('dance');
console.log(child2.hobby); // [ 'sing', 'swim', 'run', 'dance' ]
```

利用构造函数继承本质上是在子类型`Child`里执行了一遍`Parent`函数，并将this绑定的变量都切换到了`Child`上,执行Parent()函数中定义的所有对象初始化代码。这样每个`Child`实例都拥有了自己的`hobby`属性副本，解决了原型链继承的引用值类型会被实例共享的问题。

利用构造函数继承也有它的问题，每次创建一个`Child`的实例对象，都会执行一遍`Parent`函数，就没有函数复用的概念了。

## 组合继承

```js
function Parent(name) {
  this.hobby = ['sing', 'swim', 'run'];
  this.name = name;
}

Parent.prototype.say = function() {
  console.log(this.name);
}

function Child(name, age) {
  Parent.call(this, name);
  this.age = age;
}

Child.prototype = new Parent();
Child.prototype.constructor = Child;

Child.prototype.sayAge = function() {
  console.log(this.age);
}

const child = new Child('zhang', 24);

console.log(child.hobby); // ['sing', 'swim', 'run']
console.log(child.name); // zhang
console.log(child.age); // 24
child.say(); // zhang
child.sayAge(); // 24
```

组合继承是比较常用的继承方法，结合了原型链继承和构造函数继承的优点，通过使用原型链实现对原型的属性和方法继承，通过利用构造函数实现对实例属性的继承。

## 寄生组合式继承

虽然组合继承是最常用的继承模式，但是也有它的不足。无论在什么情况下，组合继承都要调用2次父类的构造函数。第一次在创建子类原型的时候，第二次在子类构造函数内部。

```js
function Parent(name) {
  this.hobby = ['sing', 'swim', 'run'];
  this.name = name;
}

Parent.prototype.say = function() {
  console.log(this.name);
}

function Child(name, age) {
  Parent.call(this, name); // 第二次调用
  this.age = age;
}

Child.prototype = new Parent(); // 第一次调用
Child.prototype.constructor = Child;

Child.prototype.sayAge = function() {
  console.log(this.age);
}
```
上述代码中调用了两次`Parent`构造函数，第一次调用会在`Child.prototype`上添加两个属性：`hobby`和`name`。当调用`Child`构造函数时，再一次调用了`Parent`构造函数,这是在新的对象上又创建了实例属性`hobby`和`name`。这两个属性就屏蔽了原型上的两个同名属性。

所以在第一次调用构造函数是并没有什么必要的，`Child.prototype`并不需要函数内部的实例属性，只需要原型上的方法就行了。

于是就有了寄生组合式继承：

```js
function Parent(name) {
  this.hobby = ['sing', 'swim', 'run'];
  this.name = name;
}

Parent.prototype.say = function() {
  console.log(this.name);
}

function Child(name, age) {
  Parent.call(this, name);
  this.age = age;
}

function create(proto) {
  function F(){}
  F.prototype = proto;
  return new F();
}

Child.prototype = create(Parent.prototype);
Child.prototype.constructor = Child;

Child.prototype.sayAge = function() {
  console.log(this.age);
}
```

与组合式继承不同，寄生组合式继承不需要调用两次父类的构造函数，代替的是利用`create`函数来继承`Parent`原型上的方法。

在`create`函数的内部，先创建了一个临时的构造函数`F`,将传入的对象`proto`赋值给`F`的原型，最后返回`F`的实例。本质上`create`函数对传入的对象进行了一次浅复制。`Object.create()`与此方法的行为相同。

## ES6 继承

ES6 继承 利用了关键字 `extends`

```js
class Parent {
  constructor(name) {
	  this.name = name;
  }

  say() {
    console.log(`name is ${this.name}`);
  }
}

class Child extends Parent {
  constructor(name) {
    super();
	  this.name = name;
  }
}

const child = new Child('zhang');
child.say(); // name is zhang
```

在babel的编译下

```js
function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Child = function (_Parent) {
  _inherits(Child, _Parent);

  function Child(name) {
    _classCallCheck(this, Child);

    var _this = _possibleConstructorReturn(this, (Child.__proto__ || Object.getPrototypeOf(Child)).call(this));

    _this.name = name;
    return _this;
  }

  return Child;
}(Parent);
```

上面`_inherits`方法的本质其实就是让Child子类继承Parent父类原型链上的方法。

```js
Child.prototype = Object.create(Parent.prototype);
Object.setPrototypeOf(Child, Parent);
```

Object.create接收第二个参数，这就实现了对Child的constructor修复。

以上通过`_inherits`实现了对父类原型链上属性的继承，那么对于父类的实例属性（就是constructor定义的属性）的继承，也可以归结为

```js
Parent.call(this);
```