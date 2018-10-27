# 算法的复杂度解析

#### 为什么需要复杂度分析？

1. 测试结果非常依赖测试环境

  测试环境中硬件的不同会对测试结果有很大的影响。比如，我们拿同样一段代码，分别用 Intel Core i9 处理器和 Intel Core i3 处理器来运行，不用说，i9 处理器要比 i3 处理器执行的速度快很多。还有，比如原本在这台机器上 a 代码执行的速度比 b 代码要快，等我们换到另一台机器上时，可能会有截然相反的结果。

2. 测试结果受数据规模的影响很大

  后面我们会讲排序算法，我们先拿它举个例子。对同一个排序算法，待排序数据的有序度不一样，排序的执行时间就会有很大的差别。极端情况下，如果数据已经是有序的，那排序算法不需要做任何操作，执行时间就会非常短。除此之外，如果测试数据规模太小，测试结果可能无法真实地反应算法的性能。比如，对于小规模的数据排序，插入排序可能反倒会比快速排序要快！

#### 如何进行复杂度分析

1. 大O表示法

```java
int cal(int n) {
  int sum = 0;
  int i = 1;
  for (; i <= n; ++i) {
    sum = sum + i;
  }
  return sum;
}
```

假设每一行的代码执行顺序都一样，为 unit-time 单位时间。 第2、3行代码执行了一次，分别需要1个 unit-time。 第4、5行是一个循环，执行了n次， 需要2n*unit-time 的时间。 所以，总时间为 (2n + 2) * unit-time。 **所有代码的执行时间 T(n) 与每行代码的执行次数成正比**

`T(n) = O(f(n))`

`n`表示数据规模大小， `f(n)`表示每行代码的执行次数总和。 例子中 T(n) = O(2n+2),这是**大O时间复杂度表示法**。。大 O 时间复杂度实际上并不具体表示代码真正的执行时间，而是表示**代码执行时间随数据规模增长的变化趋势**，所以，也叫做**渐进时间复杂度**，简称**时间复杂度**

当 n 很大时，你可以把它想象成 10000、100000。而公式中的低阶、常量、系数三部分并不左右增长趋势，所以都可以忽略。我们只需要记录一个最大量级就可以了，如果用大 O 表示法表示刚讲的那两段代码的时间复杂度，就可以记为：T(n) = O(n)； T(n) = O(n^2)

2. 时间复杂度分析

  #### 只关注循环执行次数最多的一段代码

  我刚才说了，大 O 这种复杂度表示方法只是表示一种变化趋势。我们通常会忽略掉公式中的常量、低阶、系数，只需要记录一个最大阶的量级就可以了。所以，**我们在分析一个算法、一段代码的时间复杂度的时候，也只关注循环执行次数最多的那一段代码就可以了**。这段核心代码执行次数的 n 的量级，就是整段要分析代码的时间复杂度。

  ```java
  1 int cal(int n) {
  2   int sum = 0;
  3   int i = 1;
  4   for (; i <= n; ++i) {
  5     sum = sum + i;
  6   }
  7   return sum;
  8 }
  ```
  其中第 2、3 行代码都是常量级的执行时间，与 n 的大小无关，所以对于复杂度并没有影响。循环执行次数最多的是第 4、5 行代码，所以这块代码要重点分析。前面我们也讲过，这两行代码被执行了 n 次，所以总的时间复杂度就是 O(n)。

  #### 加法法则：总复杂度等于量级最大的那段代码的复杂度

  ```java
  int cal(int n) {
    int sum_1 = 0;
    int p = 1;
    for (; p < 100; ++p) {
      sum_1 = sum_1 + p;
    }

    int sum_2 = 0;
    int q = 1;
    for (; q < n; ++q) {
      sum_2 = sum_2 + q;
    }
  
    int sum_3 = 0;
    int i = 1;
    int j = 1;
    for (; i <= n; ++i) {
      j = 1; 
      for (; j <= n; ++j) {
        sum_3 = sum_3 +  i * j;
      }
    }
  
    return sum_1 + sum_2 + sum_3;
  }
  ```
  这个代码分为三部分，分别是求 sum_1、sum_2、sum_3。我们可以分别分析每一部分的时间复杂度，然后把它们放到一块儿，再取一个量级最大的作为整段代码的复杂度。

  第一段的时间复杂度是多少呢？这段代码循环执行了 100 次，所以是一个常量的执行时间，跟 n 的规模无关。

  这里我要再强调一下，即便这段代码循环 10000 次、100000 次，只要是一个已知的数，跟 n 无关，照样也是常量级的执行时间。当 n 无限大的时候，就可以忽略。尽管对代码的执行时间会有很大影响，但是回到时间复杂度的概念来说，它表示的是一个算法执行效率与数据规模增长的变化趋势，所以不管常量的执行时间多大，我们都可以忽略掉。因为它本身对增长趋势并没有影响。

  那第二段代码和第三段代码的时间复杂度是多少呢？答案是 O(n) 和 O(n^2)。

  综合这三段代码的时间复杂度，我们取其中最大的量级。所以，整段代码的时间复杂度就为 O(n^2)。也就是说：**总的时间复杂度等于量级最大的那段代码的时间复杂度**

  #### 乘法法则：嵌套代码的复杂度等于嵌套内外代码复杂度的乘积

  ```java
  1 int cal(int n) {
  2   int ret = 0; 
  3   int i = 1;
  4   for (; i < n; ++i) {
  5     ret = ret + f(i);
  6   } 
  7 } 
  8 
  9 int f(int n) {
  10  int sum = 0;
  11  int i = 1;
  12  for (; i < n; ++i) {
  13    sum = sum + i;
  14  } 
  15  return sum;
  16 }

  ```

  我们单独看 cal() 函数。假设 f() 只是一个普通的操作，那第 4～6 行的时间复杂度就是，T1(n) = O(n)。但 f() 函数本身不是一个简单的操作，它的时间复杂度是 T2(n) = O(n)，所以，整个 cal() 函数的时间复杂度就是，T(n) = T1(n) * T2(n) = O(n*n) = O(n^2)。

3. 几种常见时间复杂度实例分析

  ![](learn11_01_01.jpg)

  #### O(1)

  首先你必须明确一个概念，O(1) 只是常量级时间复杂度的一种表示方法，并不是指只执行了一行代码。比如这段代码，即便有 3 行，它的时间复杂度也是 O(1），而不是 O(3)。

  ```java
  1 int i = 8;
  2 int j = 6;
  3 int sum = i + j;
  ```

  只要代码的执行时间不随 n 的增大而增长，这样代码的时间复杂度我们都记作 O(1)。或者说，**一般情况下，只要算法中不存在循环语句、递归语句，即使有成千上万行的代码，其时间复杂度也是Ο(1)**

  #### O(logn) O(nlogn)

  ```java
  1 i = 1;
  2 while (i <= n)  {
  3   i = i * 2;
  4 }
  ```

  根据我们前面讲的复杂度分析方法，第三行代码是循环执行次数最多的。所以，我们只要能计算出这行代码被执行了多少次，就能知道整段代码的时间复杂度。

  从代码中可以看出，变量 i 的值从 1 开始取，每循环一次就乘以 2。当大于 n 时，循环结束。还记得我们高中学过的等比数列吗？实际上，变量 i 的取值就是一个等比数列。如果我把它一个一个列出来，就应该是这个样子的：

   ![](learn11_01_02.jpg)

   所以，我们只要知道 x 值是多少，就知道这行代码执行的次数了。通过 2^x=n 求解 x 这个问题我们想高中应该就学过了，我就不多说了。x=log2n，所以，这段代码的时间复杂度就是 O(log2n)。

   ```java
   1 i = 1;
   2 while (i <= n)  {
   3   i = i * 3;
   4 }

   ```

   基于我们前面的一个理论：**在采用大 O 标记复杂度的时候，可以忽略系数，即 O(Cf(n)) = O(f(n))**。所以，O(log2n)就等于O(log3n)。因此，在对数阶时间复杂度的表示方法里，我们忽略对数的“底”，统一表示为 O(logn)。

   如果你理解了我前面讲的 O(logn)，那 O(nlogn) 就很容易理解了。还记得我们刚讲的乘法法则吗？如果一段代码的时间复杂度是 O(logn)，我们循环执行 n 遍，时间复杂度就是 O(nlogn) 了。而且，O(nlogn) 也是一种非常常见的算法时间复杂度。比如，归并排序、快速排序的时间复杂度都是 O(nlogn)。

  #### O(m+n) O(m*n)

  ```java
  int cal(int m, int n) {
    int sum_1 = 0;
    int i = 1;
    for (; i < m; ++i) {
      sum_1 = sum_1 + i;
    }

    int sum_2 = 0;
    int j = 1;
    for (; j < n; ++j) {
      sum_2 = sum_2 + j;
    }

    return sum_1 + sum_2;
  }

  ```

  从代码中可以看出，m 和 n 是表示两个数据规模。我们无法事先评估 m 和 n 谁的量级大，所以我们在表示复杂度的时候，就不能简单地利用加法法则，省略掉其中一个。所以，上面代码的时间复杂度就是 O(m+n)。

  针对这种情况，原来的加法法则就不正确了，我们需要将加法规则改为：T1(m) + T2(n) = O(f(m) + g(n))。但是乘法法则继续有效：T1(m)*T2(n) = O(f(m) * f(n))。

4. 空间复杂度分析

  ```java
  1 void print(int n) {
  2  int i = 0;
  3  int[] a = new int[n];
  4  for (i; i <n; ++i) {
  5    a[i] = i * i;
  6  }

  7  for (i = n-1; i >= 0; --i) {
  8    print out a[i]
  9  }
  10}

  ```

  跟时间复杂度分析一样，我们可以看到，第 2 行代码中，我们申请了一个空间存储变量 i，但是它是常量阶的，跟数据规模 n 没有关系，所以我们可以忽略。第 3 行申请了一个大小为 n 的 int 类型数组，除此之外，剩下的代码都没有占用更多的空间，所以整段代码的空间复杂度就是 O(n)。

  我们常见的空间复杂度就是 O(1)、O(n)、O(n^2)，像 O(logn)、O(nlogn) 这样的对数阶复杂度平时都用不到。而且，空间复杂度分析比时间复杂度分析要简单很多。所以，对于空间复杂度，掌握刚我说的这些内容已经足够了。