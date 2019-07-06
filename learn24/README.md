# vue源码笔记

子组件的创建

通过vue.extend会返回一个继承vue的子组件构造函数，该构造函数继承所有vue的生命周期。patch父组件时，发现有子组件存在，创建子组件构造函数实例，同时传入父组件的vm实例。在子组件继承的生命周期中initlifecycle函数中，父组件vm实例会挂载到字组件的$parent属性上，同时父组件实例上的$children属性上push子组件，这样形成一层父子关系。子组件也会有 init -> render -> patch过程， 也会递归地一层层子组件找下去，最后挂载在父组件上。所以整个是先由子后父的挂载顺序。

--------------------

配置合并

全局mixins

Vue.mixins方法调用mergeOption合并配置。mergeOption方法中，判断被合并的child对象，检查是否存在mixins属性，如果存在minxins，遍历minxins，对每项在进行mergeOption。在合并过程中，不同属性、生命周期，合并策略不同，详见src/core/util/options.js

全局 filters directives components 混入

vue初始化时，在vue.options中添加filters directives components 空对象属性。vue创建子组件时，会将父组件实例传递下去，子组件的会合并父组件的options赋值给自己的$options，所以全局的filters directives components，所有子组件都会注册。


