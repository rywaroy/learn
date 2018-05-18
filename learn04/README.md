# vue-router的基础用法

> 公司内部vue-router分享

## 路由的配置

创建一个个人中心页面 Center.vue

```html
<template>
  <div>Center</div>
</template>
```

在 `scr/router/index.js` 中配置个人中心页面路由

```js
import Vue from 'vue';
import Router from 'vue-router';
import Center from '@/components/Center';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/center', //路由的路径 路径可以自定义，如 /a/b/c 一般以业务去划分
      name: 'center', //路由的名字
      component: Center,
    },
  ],
});
```

访问 `http://localhost:8080/#/center` 即可得到

![](./learn04_01.png)

## 动态路由

创建一个商品页面 Product.vue

```html
<template>
  <div>
    Product
    <br>
    我的id是{{$route.params.id}}
  </div>
</template>
```

配置路由

```js
import Vue from 'vue';
import Router from 'vue-router';
import Product from '@/components/Product';

const asyncComponent = name => {
  return resolve => require([`@/components/${name}`], resolve)
}
const Product = asyncComponent('Product')

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/product/:id', // 动态路径参数 以冒号开头
      name: 'product',
      component: Product,
    },
  ],
});
```

现在 `/product/123` 和 `/product/abc` 都将映射到相同的路由

```js
export default {
  mounted() {
    console.log(this.$route.params.id);  // 通过this.$route.params 可以获取 路由的params
  },
};
```

访问 `http://localhost:8080/#/product/12345`

![](./learn04_02.png)

## 子路由

创建一个个人中心下设置页面  Set.vue

```html
<template>
  <div>Set</div>
</template>
```

配置center的子路由

```js
import Vue from 'vue';
import Router from 'vue-router';
import Center from '@/components/Center';
import Set from '@/components/Set';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/center',
      name: 'center',
      component: Center,
      children: [
        {
          path: 'set',  //可以是绝对路径或者相对路径
          name: 'set',
          component: Set,
        },
      ],
    },
  ],
});

```

在center中设置子路由的视图组件，子路由的所有内容会展示在视图组件中

```html
<template>
  <div>
    Center
    <router-view></router-view>  
  </div>
</template>
```

访问 `http://localhost:8080/#/center/set`

![](learn04_03.png)

## 路由的跳转

使用 `router-link` 跳转

```html
<router-link to="/product/111">product</router-link>

<!-- 渲染成 -->
<a href="#/product/111" class="">product</a>
```

`router-link` 默认转换成 a 标签， 可以使用`tag` 来指定

```html
<router-link to="/product/111" tag="div">product</router-link>

<!-- 渲染成 -->
<div class="">product</div>
```

借助`router`实例方法，通过编写代码来实现

```js
router.push('product')

router.push({ path: 'product' })

router.push({ name: 'product', params: { id: 123 }})

router.push({ path: 'product', query: { id: 123 }})

//替换history记录
router.replace({ path: 'product' })

//前进后退
router.go(1)
router.go(-1)
router.go(-20)
```

路由跳转带参数

```html
<!-- 跳转到 path 为 '/product/111' 的路由 -->
<router-link :to="{ path: '/product/111' }">product</router-link>

<!-- 跳转到 '/product?id=111' -->
<router-link :to="{ path: '/product', query: { id: 111 }}">product</router-link>

<!-- 还可以使用name,更为方便 '/product/111'-->
<router-link :to="{ name: 'product', params: { id: 111 }}">product</router-link>
```

### `router-link` api

* to
* replace

  * 类型： `boolean`
  * 默认值： `false`

  ```html
  <router-link :to="{ path: '/product/111' }" replace>product</router-link>
  ```

  类似于 `window.locaion.replace()` 跳转不会留下history记录

* append

  * 类型： `boolean`
  * 默认值： `false`

  设置 `append` 属性后，则在当前（相对）路径前添加基路径。例如，我们从 `/a` 导航到一个相对路径 `b`，如果没有配置 `append`，则路径为 `/b`，如果配了，则为 `/a/b`

* tag
* active-class

  * 类型： `string`
  * 默认值： `router-link-active`

  在当前路由匹配到 `router-link` 设置的路由时， `router-link` 会增加默认 `router-link-active`的类，可以增加高亮样式。设置`active-class`可以指定类名

* exact

  * 类型： `boolean`
  * 默认值： `false`

 精确匹配

## 重定向和别名

### 重定向

官网例子：

```js
const router = new VueRouter({
  routes: [
    { path: '/a', redirect: '/b' },
    { path: '/a', redirect: { name: 'foo' }}
  ]
})
```

假设有2个路由 `/a/b` 和 `/a/c`，`b` 和 `c` 都是 `a` 的子路由，那可以将 `/a/` 路由重定向为 `/a/b`， 使得默认访问`b`


### 别名

官网例子:

```js
const router = new VueRouter({
  routes: [
    { path: '/a', component: A, alias: '/b' }
  ]
})
```

`/b` 是 `/a` 的别名，访问 `/b` 会匹配 `/a`，引用`A组件`, 与重定向不同的是 URL 会保持 `/b`


## 导航守卫

重要！

一般用于路由变化时，导航守卫通过跳转或取消的方式守卫导航。例如在未登录时，无法跳转到需要登录的页面，从而引入到登录页面

```js
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查路由 meta 属性，判断requiresAuth 的 值
    if (!auth.loggedIn()) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next() // 确保一定要调用 next()
  }
})
```

其中守卫方法接受3个参数:

* `to` : 即将进入的路由对象
* `from` : 当前离开的路由
* `next` : 路由跳转方法（必须调用）

除了 `beforeEach` , 与之相反 还有一个 `afterEach` , `afterEach`不会接受 next 函数也不会改变导航本身

```js
router.afterEach((to, from) => {
  // ...
})
```


### 组件内守卫

组件内独享，针对于当个页面

* `beforeRouteEnter`
* `beforeRouteUpdate`
* `beforeRouteLeave`

```js
const Foo = {
  template: `...`,
  beforeRouteEnter (to, from, next) {
    // 在渲染该组件的对应路由被 confirm 前调用
    // 不！能！获取组件实例 `this`
    // 因为当守卫执行前，组件实例还没被创建
  },
  beforeRouteUpdate (to, from, next) {
    // 在当前路由改变，但是该组件被复用时调用
    // 举例来说，对于一个带有动态参数的路径 /foo/:id，在 /foo/1 和 /foo/2 之间跳转的时候，
    // 由于会渲染同样的 Foo 组件，因此组件实例会被复用。而这个钩子就会在这个情况下被调用。
    // 可以访问组件实例 `this`
  },
  beforeRouteLeave (to, from, next) {
    // 导航离开该组件的对应路由时调用
    // 可以访问组件实例 `this`
  }
}
```