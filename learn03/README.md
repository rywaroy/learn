# vue进阶

> 公司内部vue进阶分享

<font color=red>注：带例子的都是非常实用的基础用法！！</font>

## 修饰符

* 事件修饰符

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

* 按键修饰符

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
    
* `v-model` 的修饰符
    
    *  `lazy` (在“change”时而非“input”时更新)
    
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

* `.sync` 修饰符 2.3.0+

  用于props的“双向绑定”，在vue1.x中，子组件可以直接改变父组件所绑定的值，非常方便但破坏了单向数据设计，在vue2.x中被移除。
  
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
