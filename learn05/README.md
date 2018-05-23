# vuex的基础用法

> 公司内部vuex分享

### 配置

在 `src` 下创建 `store` 文件夹并增加 `index.js` 入口文件

```js
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);
export default new Vuex.Store({
  state: {},
  getters: {},
  mutations: {},
  actions: {},
  modules: {},
});
```
在 `main.js` 下挂载到Vue

```js
import store from './store';

new Vue({
  store,
});
```


### 例子

```html
<template>
  <div>
    <button @click="dec()">减少</button>
    <span>{{number}}</span>
    <span>{{type}}</span>
    <button @click="inc()">增加</button>
  </div>
</template>
<script>
export default {
  data() {
    return {
      number: 0,
    };
  },
  computed: {
    type() {
      return this.number % 2 === 0 ? '偶数' : '奇数';
    },
  },
  methods: {
    inc() {
      const number = this.number;
      this.number = number + 1;
    },
    dec() {
      const number = this.number;
      this.number = number - 1;
    },
  },
};
</script>
```

### State

在 `store/index.js` 下的 `state` 对象中设置 `number`

```js
state: {
  number: 0,
},
```

由于 Vuex 的状态存储是响应式的，从 store 实例中读取状态最简单的方法就是在`计算属性`中返回某个状态

```js
export default {
  data() {
    return {
      number: 0,
    };
  },
  computed: {
    number2() {
      return this.$store.state.number;
    },
  },
};
```

每当 `$store.state.number` 发生变化的时候，都会重新求取计算属性，并且触发更新相关DOM

#### `mapState` 辅助函数

```js
import { mapState } from 'vuex'

computed: mapState({
  // 箭头函数
  number2: state => state.number,

  // 字符串形式，等同于 'state => state.number'
  number2: 'number',

  // 为了能够使用 `this` 获取局部状态，必须使用常规函数
  number2(state) {
    return state.number
  }
}),
```

当映射的计算属性的名称与 state 的子节点名称相同时，我们也可以给 mapState 传一个字符串数组 (这里使用了`number2` 与 `number` 不同所以无法使用)

```js
computed: mapState([
  // 映射 this.number 为 store.state.number
  'number'
])
```

#### 对象展开运算符

当同时有其他计算属性的时候，可以写作

```js
computed: {
  type() {
      return this.number % 2 === 0 ? '偶数' : '奇数';
  },

  // 使用对象展开运算符将此对象混入到外部对象中
  ...mapState({
    number2: state => state.number,
  })
}
```

### Getter

类似 `computed` 

```js
getters: {
  type(state) {
    return state.number % 2 === 0 ? '偶数' : '奇数';
  },
},
```

```js
computed: {
  type() {
    return this.number % 2 === 0 ? '偶数' : '奇数';
  },
  type2() {
    return this.$store.getters.type;
  },
},
```

#### `mapGetters` 辅助函数

```js
import { mapGetters } from 'vuex'

export default {
  // ...
  computed: {
  // 使用对象展开运算符将 getter 混入 computed 对象中
    ...mapGetters([
      'type2',
      // ...
    ])
  }
}
```

```js
mapGetters({
  // 映射 `this.doneCount` 为 `store.getters.doneTodosCount`
  type2: 'type2',
})
```

### Mutation

更改 Vuex 的 store 中的状态的唯一方法是提交 mutation。Vuex 中的 mutation 非常类似于事件：每个 mutation 都有一个字符串的 事件类型 (type) 和 一个 回调函数 (handler)。这个回调函数就是我们实际进行状态更改的地方，并且它会接受 state 作为第一个参数

```js
mutations: {
  inc(state, data = 1) {
    const number = state.number;
    state.number = number + data;
  },
  dec(state) {
    const number = state.number;
    state.number = number - 1;
  },
},
```

```js
methods: {
  inc() {
    const number = this.number;
    this.number = number + 1;
  },
  dec() {
    const number = this.number;
    this.number = number - 1;
  },
  inc2() {
    this.$store.commit('inc');
  },
  dec2() {
    this.$store.commit('dec');
  },
},
```

#### `mapMutations` 辅助函数

```js
methods: {
  ...mapMutations([
    'inc', // 将 `this.inc()` 映射为 `this.$store.commit('inc')`
    // `mapMutations` 也支持载荷：
    // `this.inc(data)`  映射为 `this.$store.commit('inc', data)`
  ]),
  ...mapMutations({
    inc2: 'inc' // 将 `this.inc2()` 映射为 `this.$store.commit('inc')`
  })
}
```


### Action

Action 类似于 mutation，不同在于：

* Action 提交的是 mutation，而不是直接变更状态。
* Action 可以包含任意异步操作。

```js
const store = new Vuex.Store({
  state: {
    list: []
  },
  mutations: {
    setList (state, data) {
      state.list = data
    }
  },
  actions: {
    getList ({ commit, dispatch }, page) {
      axios.get(`/api/list?page=${page}`)
        .then(res => {
          commit('setList', res.data.data)
        })
    }
  }
})
```

分发 Action

```js
mounted() {
  getData() {
    this.$store.dispatch('getList', 1)
  },
},
```

结合 `Promise`

```js
actions: {
  getList ({ commit }, page) {
    return new Promise((resolve, reject) => {
      axios.get(`/api/list?page=${page}`)
        .then(res => {
          commit('setList', res.data.data)
          resolve()
        })
    })
  }
}
```

这样就可以：

```js
mounted() {
  getData() {
    this.$store.dispatch('getList', 1)
      .then(() => {
        //获取成功
        Loading.hide()
      })
  },
},
```

##### `mapActions` 辅助函数

```js
import { mapActions } from 'vuex'

export default {
  // ...
  methods: {
    ...mapActions([
      'increment', // 将 `this.increment()` 映射为 `this.$store.dispatch('increment')`

      // `mapActions` 也支持载荷：
      'incrementBy' // 将 `this.incrementBy(amount)` 映射为 `this.$store.dispatch('incrementBy', amount)`
    ]),
    ...mapActions({
      add: 'increment' // 将 `this.add()` 映射为 `this.$store.dispatch('increment')`
    })
  }
}
```

### Module

由于使用单一状态树，应用的所有状态会集中到一个比较大的对象。当应用变得非常复杂时，store 对象就有可能变得相当臃肿。

为了解决以上问题，Vuex 允许我们将 store 分割成模块（module）。每个模块拥有自己的 state、mutation、action、getter、甚至是嵌套子模块——从上至下进行同样方式的分割：

```js
const moduleA = {
  state: { ... },
  mutations: { ... },
  actions: { ... },
  getters: { ... }
}

const moduleB = {
  state: { ... },
  mutations: { ... },
  actions: { ... }
}

const store = new Vuex.Store({
  modules: {
    a: moduleA,
    b: moduleB
  }
})

store.state.a // -> moduleA 的状态
store.state.b // -> moduleB 的状态
```

#### 命名空间

讲上面代码放入名为`count`的modules下

```js
modules: {
  count: {
    namespaced: true, // 设置命名空间
    state: {
      number: 1, // this.$store.state.count.number;
    },
    getters: {
      type(state) { // this.$store.getters['count/type'];
        return state.number % 2 === 0 ? '偶数' : '奇数';
      },
    },
    mutations: {
      inc(state, data = 1) { // this.$store.commit('count/inc');
        const number = state.number;
        state.number = number + data;
      },
      dec(state) { // this.$store.commit('count/dec');
        const number = state.number;
        state.number = number - 1;
      },
    },
  }
}
```