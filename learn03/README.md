# vue进阶

> 公司内部vue进阶分享

注：带例子的都是非常实用的基础用法！！

## 修饰符

* ### 事件修饰符

    * `.stop` (阻止事件冒泡) 
    
    ```html
    <template>
      <div class="a" @click="clickA()">
        <div class="b" @click.stop="clickB()"></div>
      </div>
    </template>
    ```

    ```js
    export default {
      methods: {
        clickA() {
          console.log('我是a');
        },
        clickB() {
          console.log('我是b');
        },
      },
    };

    // 点击b --> 我是b     
    ```
    
    * `.prevent` (取消事件的默认动作)
    * `.capture` (添加事件监听器时使用事件捕获模式，即元素自身触发的事件先在此处处理，然后才交由内部元素进行处理)
    
    ```html
    <template>
      <div class="a" @click.capture="clickA()">
        <div class="b" @click="clickB()">
          <div class="c" @click="clickC()"></div>
        </div>
      </div>
    </template>
    ```

    ```js
    export default {
      methods: {
        clickA() {
          console.log('我是a');
        },
        clickB() {
          console.log('我是b');
        },
        clickC() {
          console.log('我是c')
        }
      },
    };

    // 点击c
    // --> 我是a 
    // --> 我是c
    // --> 我是b         
    ```
    
    * `.self` (只当在 event.target 是当前元素自身时触发处理函数)
    
    ```html
    <template>
      <div class="a" @click.self="clickA()">
        <div class="b" @click="clickB()"></div>
      </div>
    </template>
    ```

    ```js
    export default {
      methods: {
        clickA() {
          console.log('我是a');
        },
        clickB() {
          console.log('我是b');
        },
      },
    };

    // 点击b
    // --> 我是b 
    // 点击a (仅当点击a时触发clickA)
    // --> 我是a         
    ```
    
    * `.once` (点击事件将只会触发一次)

* ### 按键修饰符

    在监听键盘事件时，我们经常需要检查常见的键值。Vue 允许为 v-on 在监听键盘事件时添加按键修饰符：

    ```html
    <!-- 只有在 `keyCode` 是 13 时调用 `vm.submit()` -->
    <input v-on:keyup.13="submit">
    ```

    * `.enter`

    ```html
    <input v-on:keyup.enter="login()">
    ```

    * `.tab`
    * `.delete`
    * `.esc`
    * `.up`
    * `.down`
    * `.left`
    * `.right`

    可以通过全局 config.keyCodes 对象自定义按键修饰符别名：

    ```js
    // 可以使用 `v-on:keyup.f1`
    Vue.config.keyCodes.f1 = 112
    ```

* ### 系统修饰键
  
  2.1.0 新增

  > 注意：在 Mac 系统键盘上，meta 对应 command 键 (⌘)。在 Windows 系统键盘 meta 对应 Windows 徽标键 (⊞)。在 Sun 操作系统键盘上，meta 对应实心宝石键 (◆)。在其他特定键盘上，尤其在 MIT 和 Lisp 机器的键盘、以及其后继产品，比如 Knight 键盘、space-cadet 键盘，meta 被标记为“META”。在 Symbolics 键盘上，meta 被标记为“META”或者“Meta”。

  * `ctrl`

    ```html
      <!-- Ctrl + Click -->
      <div @click.ctrl="doSomething">Do something</div>
    ```
  * `alt`

    ```html
      <!-- Alt + C -->
      <input @keyup.alt.67="clear">
    ```
  * `shift`
  * `meta`
    
* ### `v-model` 的修饰符
    
    *  `.lazy` (在“change”时而非“input”时更新)
    
    ```html
    <input v-model.lazy="msg" >
    ```
    
    * `.number` (输入值转为数值类型)
    
    ```html
    <input v-model.number="age" type="number">
    ```
    
    * `.trim` (绑定值去除首尾空白字符)
    
    ```html
    <input v-model.trim="msg">
    ```

* ### `.sync` 修饰符 2.3.0+

  用于props的“双向绑定”，在vue1.x中，子组件可以直接改变父组件所绑定的值，非常方便但破坏了单向数据设计，在vue2.x中被移除。
  
  在vue2.3.0中被重新加回，但这次只作为一个编译时的语法糖存在。它会被扩展为一个自动更新父组件属性的 `v-on` 监听器

  vue官网例子:  

  ```html
  <comp :foo.sync="bar"></comp>
  ```

  会被扩展为：

  ```html
  <comp :foo="bar" @update:foo="val => bar = val"></comp>
  ```

  当子组件需要更新 `foo` 的值时，它需要显式地触发一个更新事件：

  ```js
  this.$emit('update:foo', newValue)
  ```

  当使用一个对象一次性设置多个属性的时候，这个 `.sync` 修饰符也可以和 `v-bind` 一起使用：

  ```html
  <comp v-bind.sync="{ foo: 1, bar: 2 }"></comp>
  ```

  这个例子会为 `foo` 和 `bar` 同时添加用于更新的 v-on 监听器。


## 计算属性、侦听器、过滤器

* ### 计算属性

  ```html
  <p>单价：{{price}}</p>
  <p>数量：{{amount}}</p>
  <p>折扣：{{discount}}</p>
  <p>邮费：{{postage}}</p>
  <!-- bad -->
  <p>总价：{{price * amount * discount + postage}}</p>
  <!-- good -->
  <p>总价：{{total}}</p>
  ```

  ```js
  computed: {
      total: function () {
        return this.price * this.amount * this.discount + this.postage
      }
  }
  ```
  模板内的表达式非常便利，但是写入过多的逻辑会导致代码可读性变差，后期难以维护，因此需要使用vue的计算属性。

  计算属性会根据它的相关依赖（price、amount等）发生改变会重新求值。同理，计算属性下没有响应式依赖，那计算属性将不再更新

* ### 侦听器

  ```html
  <template>
    <ul class="page" @click="onPagerClick($event)">
      <li class="page-item">1</li>
      <li class="page-item">2</li>
      <li class="page-item">3</li>
    </ul>
  </template>
  ```

  ```js
  export default {
    data() {
      return {
        page: 1,
      };
    },
    methods: {
      onPagerClick(event) {
        const target = event.target;
        if (target.tagName === 'LI') {
          this.page = Number(target.textContent);
        }
      },
    },
    watch: {
      page() {
        this.getData() //请求数据
      }
    },
  };

  ```

  与计算属性类似，且绝大多数数情况下计算属性会更合适，但遇到在数据变化时执行异步或开销较大的操作时，通过`watch`去监听数据，响应数据变化会更合适。

  `watch`还有一个特点是最初绑定的时候是不会执行的，等到`page`改变时才会请求数据。如果需要最初绑定的时候就执行方法，则要改变watch的写法

  ```js
  watch: {
    page: {
      handler() {
        this.getData();
      },
      immediate: true, // 代表声明了page就立即执行handler方法
    },
  },
  ```

  `watch`还有`deep`属性，默认值是`fasle`，代表深度监听

  ```js
  data() {
    return {
      obj: {
        a: 1,
      },
    };
  },
  watch: {
    obj: {
      handler() {
        console.log('obj改变了')
      },
      // deep: true,
    },
  },
  ```

  当改变`obj.a`时，是无法监听到的。如果想监听`obj`里的属性`a`值，设置`deep`为`true`。监听器会一层层的往下遍历，给对象的所有属性都加上这个监听器，但是这样性能开销就会非常大了，任何修改`obj`里面任何一个属性都会触发这个监听器里的`handler`。

  或者可以以字符串的形式监听

  ```js
  watch: {
    'obj.a': {
      handler() {
        console.log('obj改变了')
      },
    },
  },
  ```


* ### 过滤器


  ```html
  <p>时间：{{time | getTime}}</p> <!-- 时间：2018-04-24 15:34:26 --> 
  <p>时间：{{time | getTime | localTime}}</p> <!-- 时间：2018-04-24 15:34:26北京时间 --> 
  <p>时间：{{time | newTime('上午')}}</p>  <!-- 时间：2018-04-24 15:34:26上午 -->
  <p :time="time | getTime"></p> <!-- 2.1.0+ 支持在v-bind上添加过滤器 -->
  ```

  ```js
  data() {
    return {
      time: 1524554794000,
    };
  },
  filters: {
    getTime(time) {
      return moment(time).format('YYYY-MM-DD HH:ss:mm')
    },
    localTime(time) {
      return time + '北京时间'
    },
    newTime(time, data) {
      return moment(time).format('YYYY-MM-DD HH:ss:mm') + data
    }，
  }

  //全局注册
  Vue.filter('getTime',time => (
    moment(time).format('YYYY-MM-DD HH:ss:mm')
  ))
  ```
  自定义过滤器，可以用于一些常见的文本格式化(如时间戳转时间格式)

## 组件

* ### 自定义事件

  父组件

  ```html
  <template>
    <child @say="saywhat"/>
  </template>
  <script>
  import child from './Child'
  export default {
    name: 'parent',
    methods: {
      saywhat(word) {
        console.log(word)
      }
    },
    components: {
      child,
    }
  }
  </script>
  ```

  子组件

  ```html
  <template>
    <div @click="isay">child</div>
  </template>
  <script>
  export default {
    name: 'child',
    methods: {
      isay() {
        this.$emit('say', '我是子组件')
      }
    }
  }
  </script>
  ```

* ### 自定义组件的`v-model`

  ```js
  // Radio.vue
  export default {
    model: {
      prop: 'value',
      event: 'change',
    },
    props: {
      label: [String, Number],
      value: [String, Number],
      disabled: {
        type: Boolean,
        default: false,
      },
    },
    methods: {
      check() {
        if (!this.disabled) {
          this.$emit('change', this.label);
        }
      },
    },
  }
  ```

  ```html
  <Radio v-model="value" label="选项1" />
  ```

  等价于

  ```html
  <Radio
    :value="value"
    @change="val => { value = val }"
    label="选项1"/>
  ```

* ### 使用插槽分发内容

  * #### 单个插槽

    ```html
    <!-- Child.vue -->

    <template>
      <div @click="isay">
        <slot>默认显示内容</slot>
      </div>
    </template>
    ```

    ```html
    <!-- Parent.vue -->

    <!-- 显示：默认显示内容 -->
    <child @say="saywhat"></child>

    <!-- 显示：我是子组件 -->
    <child @say="saywhat">我是子组件</child>

    ```

  * #### 具名插槽

    移动端头部

    ```html
    <template>
      <header>
        <div class="back"></div>
        <div class="title">{{title}}</div>
        <slot name="icon"></slot>
      </header>
    </template>
    ```

    单个页面

    ```html
    <my-header title="个人中心">
      <div class="set-icon" slot="icon"></div>
    </my-header>
    ```

* ### 子组件引用

  尽管有 prop 和事件，但是有时仍然需要在 JavaScript 中直接访问子组件。为此可以使用 `ref` 为子组件指定一个引用 ID

  ```js
  //子组件

  export default {
    name: 'child',
    methods: {
      isay() {
        console.log('我是子组件')
      }
    }
  }
  ```

  ```html
  <!--  父组件 -->

  <template>
      <child ref="child"></child>
  </template>
  <script>
  import child from './Child'
  export default {
    name: 'parent',
    mounted() {
      console.log(this.$refs.child)
      this.$refs.child.isay() //直接调用子组件isay方法
    },
    components: {
      child,
    }
  }
  </script>
  ```

## 进入/离开 & 列表过渡

Vue 提供了 `transition` 的封装组件，在下列情形中，可以给任何元素和组件添加进入/离开过渡

适用条件

* 条件渲染（使用`v-if`）
* 条件展示（使用`v-show`）
* 动态组件
* 组件根节点

### 过渡的类名

在进入/离开的过渡中，会有 6 个 class 切换。

1.  `v-enter`: 定义进入过渡的开始状态。在元素被插入之前生效，在元素被插入之后的下一帧移除。

2.  `v-enter-active`: 定义进入过渡生效时的状态。在整个进入过渡的阶段中应用，在元素被插入之前生效，在过渡/动画完成之后移除。这个类可以被用来定义进入过渡的过程时间，延迟和曲线函数。

3.  `v-enter-to`: 2.1.8版及以上 定义进入过渡的结束状态。在元素被插入之后下一帧生效 (与此同时 `v-enter` 被移除)，在过渡/动画完成之后移除。

4.  `v-leave`: 定义离开过渡的开始状态。在离开过渡被触发时立刻生效，下一帧被移除。

5.  `v-leave-active`: 定义离开过渡生效时的状态。在整个离开过渡的阶段中应用，在离开过渡被触发时立刻生效，在过渡/动画完成之后移除。这个类可以被用来定义离开过渡的过程时间，延迟和曲线函数。

6.  `v-leave-to`: 2.1.8版及以上 定义离开过渡的结束状态。在离开过渡被触发之后下一帧生效 (与此同时 `v-leave` 被删除)，在过渡/动画完成之后移除。

![](./learn03_01.png)

对于这些在过渡中切换的类名来说，如果你使用一个没有名字的 `<transition>`，则 v- 是这些类名的默认前缀。如果你使用了 `<transition name="my-transition">`，那么 `v-enter` 会替换为 `my-transition-enter`。

`v-enter-active` 和 `v-leave-active` 可以控制进入/离开过渡的不同的缓和曲线。

例子

```css
.main.transition{
  transition: all .4s cubic-bezier(.55,0,.1,1);
}
.slide-left-enter, .slide-right-leave-active {
  opacity: 0;
  transform: translate(100%, 0);
}
.slide-left-leave-active, .slide-right-enter {
  opacity: 0;
  transform: translate(-100%, 0);
}
```