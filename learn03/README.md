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