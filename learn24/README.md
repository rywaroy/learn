# vue源码笔记

子组件的创建

通过vue.extend会返回一个继承vue的子组件构造函数，该构造函数继承所有vue的生命周期。patch父组件时，发现有子组件存在，创建子组件构造函数实例，同时传入父组件的vm实例。在子组件继承的生命周期中initlifecycle函数中，父组件vm实例会挂载到字组件的$parent属性上，同时父组件实例上的$children属性上push子组件，这样形成一层父子关系。子组件也会有 init -> render -> patch过程， 也会递归地一层层子组件找下去，最后挂载在父组件上。所以整个是先由子后父的挂载顺序。

--------------------

配置合并

全局mixins

Vue.mixins方法调用mergeOption合并配置。mergeOption方法中，判断被合并的child对象，检查是否存在mixins属性，如果存在minxins，遍历minxins，对每项在进行mergeOption。在合并过程中，不同属性、生命周期，合并策略不同，详见src/core/util/options.js

全局 filters directives components 混入

vue初始化时，在vue.options中添加filters directives components 空对象属性。vue创建子组件时，会将父组件实例传递下去，子组件的会合并父组件的options赋值给自己的$options，所以全局的filters directives components，所有子组件都会注册。


--------

组件注册

组件初始化中，会将options对象中的components的组件对象转化为组件的构造函数。在组件init初始化中，在merge options时会调用 resolveConstructorOptions 方法。里面判断了是否存在option.name，如果存在，就会在options的components对象上加上上components[option.name]，所以配置了name属性的组件，自身就会注册自身组件。

--------

响应式对象

vue初始化中，会调用initState方法，对 props data 中的对象进行响应式处理，利用Object.defineProperty对数据进行监听。遍历所有属性，如果是该属性的值是对象，则会深度遍历下去。调用defineReactive方法对 对象以及它键值添加简体。

---------

依赖收集

在Object.defineProperty处理中，vue会在get中进行依赖收集。在触发render方法，会访问的模板中的属性，触发属性的get，收集到当前的依赖。在render过程中，会调用cleanupDeps方法进行判断，清除模板中失效的依赖提高性能。


------

派发更新

当数据发送变化，触发set，调用dep.notify()方法通知订阅者。在notify中，会遍历dep中的subs数组中的watcher，调用watcher的update方法。update中会调用queueWatcher方法，把watcher推入栈中，在nextTick后调用watcher的run方法，重新渲染。

